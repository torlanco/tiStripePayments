// TODO - it would be cool to have the stripeId here, we would need it to be persistent
var stripe = require(WPATH('stripe'));
console.log(stripe.getStripeId());

$.card = $.args.cardId ? Alloy.Collections.cards.get($.args.cardId).toJSON() : {};

switch ($.args.varType) {
    case "add":
        title = "Add";
        break;
    case "edit":
        title = "Edit";
        setData($.card);

        // FIXME
        $.cardNumber.editable = false;
        $.cardCvc.editable = false;
        break;
    case "pay":
        title = "Pay";
        setData($.card);

        $.cardName.editable = false;
        $.cardExpMonth.editable = false;
        $.cardExpYear.editable = false;
        $.cardNumber.editable = false;
        $.cardCvc.editable = false;

        $.saveCardSwitchHolder.visible = true;

        $.amount = $.args.amount || 0;
        $.currency = $.args.currency || 'USD';
        $.description = $.args.description || 'Testing';
}

$.cardForm.open();
$.dataTitle.text = title;
if ($.args.varType !== 'pay') $.submit.title = 'Submit';

function setData(card) {
    $.cardName.value = $.card.name;
    $.cardExpMonth.value = $.card.exp_month;
    $.cardExpYear.value = $.card.exp_year;
    $.cardNumber.value = stripe.generateCardNumber($.card.last4);
    $.cardCvc.value = '\u00B7\u00B7\u00B7';
}

function close(e){
    $.cleanup();
    $.cardForm.close();
}

function submit(e){
    switch ($.args.varType) {
        case "add":
            stripe.createCard(stripe.getStripeId(),
                false, // token
                $.cardName.value,
                $.cardNumber.value,
                $.cardCvc.value,
                $.cardExpMonth.value,
                $.cardExpYear.value,
                successCallback,
                function errorCallback(e) {
                    if (e.error && e.error.message) alert(e.error.message);
                    else alert(e);
                });
            break;
        case "edit":
            // ToDo what about cvv and number?
            // function(customerId, cardId, name, month, year, successCallback, errorCallback)
            stripe.updateCard(stripe.getStripeId(),
                $.card.id,
                $.cardName.value,
                $.cardExpMonth.value,
                $.cardExpYear.value,
                successCallback,
                errorCallback
            );
            break;
        case "pay":
            if ($.card) {
                return stripe.charges($.amount, 'USD', 'Testing', $.card.customer, function success(e) {
                    console.info(e);
                });
            }

            // function(number, cvc, month, year, successCallback, errorCallback)
            // stripe.createCardToken($.cardNumber.value, $.cardCvc.value, $.cardExpMonth.value, $.cardExpYear.value, function(e){
            //     console.log("response from success");
            //     // save card if need
            //     if($.saveCardSwitch.value) {
            //         // function(customerId, token, name, number, cvc, month, year, successCallback, errorCallback)
            //         stripe.createCard(stripe.getStripeId(), e.id, $.cardName.value, $.cardNumber.value, $.cardCvc.value, $.cardExpMonth.value, $.cardExpYear.value, function(e){
            //             console.log('saved');
            //             // console.log(e);
            //         }, function(e){
            //             console.log('error on save');
            //             // console.log(e);
            //         });
            //     }

            // }, function(e){
            //     if (e.error && e.error.message) alert(e.error.message);
            //     else alert(e);
            // });
    }
}

function successCallback(e) {
    console.warn('SUCCESS');
    close();
}

function errorCallback(e) {
    console.error('ERROR', e);
    close();
}

$.cleanup = function() {
    // let Alloy clean up listeners to global collections for data-binding
    // always call it since it'll just be empty if there are none
    $.destroy();

    // remove all event listeners on the controller
    $.off();
};

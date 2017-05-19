// TODO - it would be cool to have the stripeId here, we would need it to be persistent
var stripe = require(WPATH('stripe'));
console.log(stripe.getStripeId());

$.card = $.args.cardId ? Alloy.Collections.cards.get($.args.cardId).toJSON() : null;

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
        if (!_.isEmpty($.card)) {
            setData($.card);

            $.cardName.editable = false;
            $.cardExpMonth.editable = false;
            $.cardExpYear.editable = false;
            $.cardNumber.editable = false;
            $.cardCvc.editable = false;
        }

        $.saveCardSwitchHolder.visible = true;

        $.amount = $.args.amount || 100;
        $.currency = $.args.currency || 'USD';
        $.description = $.args.description || 'Testing';
}

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
            createCard(false, function success(e) {
                console.info('CREATED');
                close();
            }, function error(e) {
                console.error('ERROR ON CREATE', e);
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
                return stripe.charges($.amount, $.currency, $.description, $.card.customer,
                    function success(e) {
                        console.info(e);
                    }
                );
            }
            else {
                stripe.createCardToken(
                    $.cardNumber.value,
                    $.cardCvc.value,
                    $.cardExpMonth.value,
                    $.cardExpYear.value,
                    function success(token) {
                        console.log('token', token);
                        if($.saveCardSwitch.value) {
                            createCard(token, function success(card) {
                                card = card.toJSON()
                                console.info('SAVED', card);

                                // charge
                                return stripe.charges($.amount, $.currency, $.description, card.customer, null,
                                    function success(e) {
                                        console.info('CHARGED', e);
                                        alert('CHARGED');
                                    }
                                );
                            }, function error(e) {
                                console.error('ERROR ON SAVE', e);
                            });
                        }
                        else {
                            // charge
                            return stripe.charges($.amount, $.currency, $.description, null, token,
                                function success(e) {
                                    console.info('CHARGED', e);
                                    alert('CHARGED');
                                }
                            );
                        }

                    }, function error(e){
                        if (e.error && e.error.message) alert(e.error.message);
                        else alert(e);
                    }
                );
            }
    }
}

function createCard(customerId, successCallback, errorCallback) {
    stripe.createCard(
        stripe.getStripeId(),
        customerId, // token
        $.cardName.value,
        $.cardNumber.value,
        $.cardCvc.value,
        $.cardExpMonth.value,
        $.cardExpYear.value,
        successCallback,
        errorCallback
    );
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

var args = arguments[0] || {};

// ToDo - it would be cool to have the stripeId here, we would need it to be persistent

var stripe = require(WPATH('stripe'));
console.log(stripe.getStripeId());

var action;

switch (args.varType) {
    case "add":
        title = "Add";
        break;
    case "edit":
        title = "Edit";
        break;
    case "pay":
        $.saveCardSwitchHolder.visible = true;
        title = "Pay";
}

$.cardForm.open();
$.dataTitle.text = title;

function close(e){
    $.cleanup();
    $.cardForm.close();
}

function submit(e){
    switch (args.varType) {
        case "add":
            // function(customerId, token, name, number, cvc, month, year, successCallback, errorCallback)
            stripe.createCard(stripe.getStripeId(), token, $.cardName.value, $.cardNumber.value, $.cardCvc.value, $.cardExpMonth.value, $.cardExpYear.value, successCallback, function(e){
                alert(e);
            });
            break;
        case "edit":
            // ToDo what about cvv and number?
            // function(customerId, cardId, name, month, year, successCallback, errorCallback)
            stripe.updateCard(stripe.getStripeId(), cardId, name, month, year, successCallback, errorCallback);
            break;
        case "pay":
            // function(number, cvc, month, year, successCallback, errorCallback)
            stripe.createCardToken($.cardNumber.value, $.cardCvc.value, $.cardExpMonth.value, $.cardExpYear.value, function(e){
                console.log("response from success");
                if($.saveCardSwitch.value){
                    // function(customerId, token, name, number, cvc, month, year, successCallback, errorCallback)
                    stripe.createCard(stripe.getStripeId(), e.id, $.cardName.value, $.cardNumber.value, $.cardCvc.value, $.cardExpMonth.value, $.cardExpYear.value, function(e){
                        console.log('saved');
                        // console.log(e);
                    }, function(e){
                        console.log('error on save');
                        // console.log(e);
                    });
                }
            }, function(e){
                alert(e);
            });
    }
}

$.cleanup = function() {
    // let Alloy clean up listeners to global collections for data-binding
    // always call it since it'll just be empty if there are none
    $.destroy();

    // remove all event listeners on the controller
    $.off();
};

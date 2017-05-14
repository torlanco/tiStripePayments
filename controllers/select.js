var stripe = require(WPATH('stripe'));

stripe.fetchCards(stripe.getStripeId());

var cardIconCodes = {
    'Visa': '\uF1F0',
    'Mastercard': '\uF1F1',
    'American Express': '\uF1F3',
    'Discover': '\uF1F2',
    'Diners Club': '\uF24C',
    'JCB': '\uF24B'
}

function transformCard(model) {
    var transformed = model.toJSON();
    transformed.icon = cardIconCodes[transformed.brand] || '';
    transformed.title = stripe.generateCardNumber(transformed.last4);

    return transformed;
}

function onItemclick(e) {
    var item = e.section.getItemAt(e.itemIndex);
    if (item.template === 'new') {
        Alloy.createWidget("com.mlstudio.payment", "form", {
            varType: 'add'
        }).getView().open({ modal: true });
    }
    else if (item.template === 'card') {
        Alloy.createWidget("com.mlstudio.payment", "form", {
            varType: 'edit',
            cardId: item.properties.itemId,
        }).getView().open({ modal: true });
    }
}

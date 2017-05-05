var stripe = require(WPATH('stripe'));

stripe.fetchCards(stripe.getStripeId());

console.log(Alloy.Collections.cards.toJSON());

function transformCard(model) {
    var transformed = model.toJSON();
    // TODO: add icon of card here based on transformed.brand
    transformed.title =
        '\u00B7\u00B7\u00B7\u00B7 \u00B7\u00B7\u00B7\u00B7 \u00B7\u00B7\u00B7\u00B7 ' + transformed.last4;
    return transformed;
}

function onItemclick(e) {
    var item = e.section.getItemAt(e.itemIndex);
    if (item.template === 'new') {
        Alloy.createWidget("com.mlstudio.payment", "form", {
            varType: 'add'
        }).getView().open({ modal: true });
    }
}

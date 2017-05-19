var stripe;
var stripeId;

exports.setupReste = function(reste) {
    stripe = new reste();
};

exports.getStripeId = function() {
    return stripeId;
}

exports.setStripeId = function(sentStripeId) {
    stripeId = sentStripeId;
}

exports.config = function(token) {
    stripe.config({
        debug: true,
        timeout: 10000,
        url: "https://api.stripe.com/v1/",
        requestHeaders: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Bearer " + token
        },
        models: [{
            name: "card",
            id: "id",
            collections: [{
                name: "cards"
            }],
        }],
        methods: [{
            name: "removeCard",
            delete: 'customers/<customerId>/sources/<cardId>'
        }, {
            name: "createCustomer",
            post: 'customers',
        }, {
            name: "createCard",
            post: 'customers/<customerId>/sources',
        }, {
            name: "getCards",
            get: "customers/<customerId>/sources?object=card"
        }, {
            name: "updateCard",
            post: 'customers/<customerId>/sources/<cardId>'
        }, {
            name: "createCardToken",
            post: 'tokens',
        }, {
            name: "chargeCustomer",
            post: "charges"
        }],
        onLoad: function(e, callback) {
            if (callback) {
                callback(e);
            }
        }
    });
};

/*****************************************************************
 *  Create a card for a stripe customer                          *
 *****************************************************************/
exports.createCustomer = function(customerInfo, successCallback, errorCallback) {
    var body = {};

    body = customerInfo;

    stripe.createCustomer(body, function(e) {
        if (e.id) {
            stripeId = e.id;
            if (successCallback) {
                successCallback(e.id);
            }
        } else if (errorCallback) {
            errorCallback(e);
        }
    });
};

/*****************************************************************
 *  Create a card for a stripe customer                          *
 *****************************************************************/
exports.createCard = function(customerId, token, name, number, cvc, month, year, successCallback, errorCallback) {
    var body = {};

    if (token) {
        body.source = token;
    } else {
        body = {
            "source[object]": "card",
            "source[number]": number,
            "source[cvc]": cvc,
            "source[exp_month]": month,
            "source[exp_year]": year,
            "source[name]": name
        };
    }
    stripe.createCard({
        customerId: customerId,
        body: body
    }, function(e) {
        console.log(e);
        if (e.id) {
            if (successCallback) {
                var card = stripe.createModel("card", e);

                Alloy.Collections.cards.add(card);

                successCallback(card);
            }
        } else if (errorCallback) {
            errorCallback(e);
        }
    });
};

/*****************************************************************
 *  Create a card token for a single use                         *
 *  Do not save into customer cards to a customer                *
 *****************************************************************/
exports.createCardToken = function(number, cvc, month, year, successCallback, errorCallback) {
    stripe.createCardToken({
        body: {
            "card[number]": number,
            "card[cvc]": cvc,
            "card[exp_month]": month,
            "card[exp_year]": year
        }
    }, function(e) {
        console.log(e);
        if (e.id) {
            if (successCallback) {
                successCallback(e.id);
            }
        } else if (errorCallback) {
            errorCallback(e);
        }
    });
};

exports.updateCard = function(customerId, cardId, name, month, year, successCallback, errorCallback) {
    stripe.updateCard({
        customerId: customerId,
        cardId: cardId,
        body: {
            name: name,
            exp_month: month,
            exp_year: year
        }
    }, function(e) {
        console.log(e);
        if (e.id) {
            if (successCallback) {
                var card = Alloy.Collections.cards.get(e.id);

                card.set(e);

                Alloy.Collections.cards.add(card, {
                    merge: true
                });

                successCallback(card);
            }
        } else if (errorCallback) {
            errorCallback(e);
        }
    });
};

exports.removeCard = function(customerId, cardId, successCallback, errorCallback) {
    stripe.removeCard({
        customerId: customerId,
        cardId: cardId
    }, function(e) {
        if (e.deleted) {
            var card = Alloy.Collections.cards.get(cardId);

            Alloy.Collections.cards.remove(card);

            if (successCallback) {
                successCallback(e);
            }
        } else if (errorCallback) {
            errorCallback(e);
        }
    });
};

exports.fetchCards = function(customerId) {
    stripe.getCards({
        customerId: customerId,
    }, function(e) {
        if (e.data) {
            Alloy.Collections.cards.reset(e.data);
        }
    });
};

exports.charges = function(amount, currency, description, customer, token, successCallback, errorCallback) {
    var body = {
        amount: amount,
        currency: currency,
        description: description
    };

    if (token) body.source = token;
    else if (customer) body.customer = customer;

    stripe.chargeCustomer({
        body: body
    }, function(e) {
        successCallback && successCallback(e);
    });
};

exports.generateCardNumber = function(last4) {
    return '\u00B7\u00B7\u00B7\u00B7 \u00B7\u00B7\u00B7\u00B7 \u00B7\u00B7\u00B7\u00B7 ' + last4;
}

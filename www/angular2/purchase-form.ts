import {Component, Input} from 'angular2/core';

declare var Stripe: any;

class class PurchaseForm {
    constructor(
        public email: string,
        public product: string,
        public stripeToken: string
    ) { }
}

interface Product {
    key: string;
    name: string;
    amount: string;
}

@Component({
    selector: 'acksin-purchase',
    template: `
<div [hidden]="paymentFormHidden">
<form action="" method="POST" id="payment-form">
<!-- We will be checking for this in the function -->

<div class="form-group">
<label>Product</label>
<div *ngFor="#i of purchaseChoices">
<input type="radio" name="product" (click)="updateProduct(i.key)" /> {{i.name}} - \${{i.amount}}
</div>
</div>

<div class="form-group">
<label>
<label>Email</label>
<input type="email" name="email" value="" class="form-control" [(ngModel)]="purchaseForm.email" />
</label>
</div>

<div class="form-group">
<label>
<label>Card Number</label>
<input type="text" size="20" data-stripe="number"  class="form-control" [(ngModel)]="cardNumber" />
</label>
</div>

<div class="form-group">
<label>
<label>CVC</label>
<input type="text" size="4" data-stripe="cvc" class="form-control"  [(ngModel)]="cvc" />
</label>
</div>

<div class="form-group input-group">
<label>Expiration (MM/YYYY)</label>
<br>
<input type="text" size="2" data-stripe="exp-month"  [(ngModel)]="expMonth" />
<span> / </span>
<input type="text" size="4" data-stripe="exp-year"  [(ngModel)]="expYear" />
</div>

<div class="form-group">
<label class="payment-errors">{{paymentErrors}}</label>
</div>

<button (click)="submit()" [disabled]="disabledForm" type="submit" class="btn btn-success">Purchase</button>
</form>
</div>

<div [(hidden)]="downloadBoxHidden">
<a [(href)]="downloadLink">Download</a>
</div>

<p>{{response}}</p>`
})
export class AcksinPurchase {
    // Modify this to create more produts.
    products: { [id: string]: Product[]; } = {
        "acksinStore": [
            { key: "AcksinStoreSingleSite", name: "Single Site License", amount: "39" },
            { key: "AcksinSiteMultiStore", name: "Multi Site License", amount: "99"  }
        ]
    };

    paymentFormHidden: bool = false;
    downloadBoxHidden: bool = true;
    disabledForm: bool = false;


    downloadLink: string = '';
    response: string = '';
    paymentErrors: string = '';

    cardNumber: string;
    cvc: string;
    expMonth: number;
    expYear: number;
    purchaseForm = new PurchaseForm();

    purchaseChoices: string[];

    constructor() {
        this.purchaseChoices = this.products[purchaseProduct];
    }


    updateProduct(product):void {
        console.log(product);
        this.purchaseForm.product = product;
    }

    submit() {
        var that = this;

        // Google Analytics  Event.
        // ga('send', 'event', 'Purchase', this.product, 'Purchase' + this.product + 'Email');

        console.log(JSON.stringify({
            number: that.cardNumber,
            cvc: that.cvc,
            exp_month: that.expMonth,
            exp_year: that.expYear
        }));


        that.disabledForm = true;

        Stripe.card.createToken({
            number: that.cardNumber,
            cvc: that.cvc,
            exp_month: that.expMonth,
            exp_year: that.expYear
        }, this.stripeHandler.bind(this));
    }


    stripeHandler(status, response):void {
        if (response.error) {
            this.paymentErrors = response.error.message;
        } else {
            this.purchaseForm.stripeToken = response.id;

            console.log("Purchase Form:" + JSON.stringify(this.purchaseForm));

            let lambda = new AWS.Lambda();
            lambda.invoke({
                FunctionName: PurchaseLambdaFunction,
                Payload: JSON.stringify(this.purchaseForm)
            }, this.lambdaHandler.bind(this));
        }
    }

    lambdaHandler(err, data):void {
        if (err) {
            console.log(err, err.stack);
        } else {
            var output = JSON.parse(data.Payload);
            console.log(data.Payload)

            if (output != null && output.downloadLink) {
                this.paymentFormHidden = true;
                this.downloadBoxHidden = false;
                this.downloadLink = output.downloadLink;
            } else {
                this.response = "Purchase Failed";
                this.disabledForm = false;
            }
        }
    }
}

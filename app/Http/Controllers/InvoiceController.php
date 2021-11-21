<?php

namespace App\Http\Controllers;

use App\Models\invoice;
use App\Models\Store;
use App\Rules\Max2Decimals;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    // TODO accept different custom params from merchant
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // TODO Overall security check
        $validator = Validator::make($request->all(), [
            // TODO More validations are required here
            'store_id' => 'required|int',
            'amount' => ['required', new Max2Decimals(), function ($attr, $val, $fail) {
                if ($val > 500000) {
                    $fail('Amount must be less than or equal to 500,000');
                }
            }],
            'order_id' => 'max:260',
            'currency' => ['required', 'exists:currencies,id'],
            'description' => '',
        ])->stopOnFirstFailure();

        if ($validator->fails()) {
            // TODO return controller here and control the errors, display properly
            return $validator->errors()->first();
        }
        // TODO More Security here...
        // Processing...
        $merchant_store = Store::find($request->store_id);

        if (!$merchant_store) {
            return 'Invalid store id';
        }

        $invoice = $merchant_store->generateInvoice([
            'amount' => $request->amount,
            'order_id' => $request->order_id,
            'currency_code' => $request->currency,
            'description' => $request->description
        ]);

        if (!$invoice) {
            Log::error('Pata ni q invoice generate nahi ho pi', [$invoice, $request->all()]);
            return 'Oops! Something went wrong while creating invoice, please try again.';
        }

        // Invoice has been generated, now redirecting to the invoice page
        return redirect(route('invoice.show', $invoice->token));
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\invoice  $invoice
     * @return \Illuminate\Http\Response
     */
    public function show(invoice $invoice)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\invoice  $invoice
     * @return \Illuminate\Http\Response
     */
    public function edit(invoice $invoice)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\invoice  $invoice
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, invoice $invoice)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\invoice  $invoice
     * @return \Illuminate\Http\Response
     */
    public function destroy(invoice $invoice)
    {
        //
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Customer;
use App\Http\Controllers\Controller;
use App\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomersController extends Controller
{
    public function byPhone(Request $request, $phone) {
        $customer = Customer::where('phone_primary', $phone)->first();

        $order = Order::where('customer_id', $customer->id)->first();

        $customer['adress'] = $order->adress;

        return new JsonResponse($customer);
    }
}
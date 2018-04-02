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

        if ($customer) {
            $order = Order::where('customer_id', $customer->id)->first();

            if ($order) {
                $customer['adress'] = $order->adress;
            }
        }

        return new JsonResponse($customer?: []);
    }
}
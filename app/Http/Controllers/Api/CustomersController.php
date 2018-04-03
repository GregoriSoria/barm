<?php

namespace App\Http\Controllers\Api;

use App\Adress;
use App\City;
use App\Customer;
use App\Http\Controllers\Controller;
use App\Neighborhood;
use App\Order;
use App\State;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomersController extends Controller
{
    public function byPhone(Request $request, $phone) {
        $customer = Customer::where('phone_primary', $phone)->orWhere('phone_secondary', $phone)->first();

        if ($customer) {
            $order = Order::where('customer_id', $customer->id)->first();

            if ($order) {
                $adress = Adress::find($order->adress_id);

                $nh = Neighborhood::find($adress->neighborhood_id);

                $city = City::find($nh->city_id);

                $state = State::find($city->state_id);

                $adress['neighborhood'] = $nh;
                $adress['city'] = $city;
                $adress['state'] = $state;

                $customer['adress'] = $adress;
            }
        }

        return new JsonResponse($customer?: []);
    }
}
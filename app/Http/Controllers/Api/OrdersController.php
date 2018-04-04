<?php

namespace App\Http\Controllers\Api;

use App\Adress;
use App\Customer;
use App\Http\Controllers\Controller;
use App\Order;
use App\OrderProduct;
use App\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrdersController extends Controller
{
    public function quick(Request $request) {
        $customer = Customer::where('phone_primary', $request->input('phone_primary'))->orWhere('phone_secondary', $request->input('phone_primary'))->first();

        if (!$customer) {
            $customer = new Customer;
        }

        $phone1 = $request->input('phone_primary');
        $phone2 = $request->input('phone_secondary');

        $customer->name = $request->input('name');
        $customer->email = $request->input('email');
        $customer->birth = $request->input('birth');
        $customer->cpf = $request->input('cpf');
        if ($phone1 && $phone2 && $phone1 != $phone2) {
            $customer->phone_primary = $phone1;
        }
        $customer->phone_secondary = $phone2;

        $customer->saveOrFail();

        $adress = new Adress;
        $adress->full_adress = $request->input('full_adress');
        $adress->adress = $request->input('adress');
        $adress->number = $request->input('number');
        $adress->neighborhood_id = $request->input('neighborhood_id');
        $adress->lat = $request->input('lat');
        $adress->long = $request->input('long');
        $adress->customer_id = $customer->id;

        $adress->saveOrFail();

        $order = new Order;
        $order->customer_id = $customer->id;
        $order->adress_id = $adress->id;
        $order->adress = $request->input('adress');
        $order->employee_id = 1;
        $order->status = "FAZENDO";

        $order->save();

        $products = $request['products'];

        for ($i = 0; $i < count($products); $i++) {
            $product = Product::where('id', $products[$i]['id'])->where('quantity', '>=', $products[$i]['quantity'])->first();
            if ($product) {
                $product->quantity -= $products[$i]['quantity'];
                $product->save();

                $productOrder = new OrderProduct;
                $productOrder->product_id = $product->id;
                $productOrder->order_id = $order->id;
                $productOrder->quantity = $products[$i]['quantity'];

                $productOrder->save();
            }
        }


        return new JsonResponse($order, 200, ['Content-type'=> 'application/json; charset=utf-8'], JSON_UNESCAPED_UNICODE);
    }
}
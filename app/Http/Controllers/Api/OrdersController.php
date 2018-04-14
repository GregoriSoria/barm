<?php

namespace App\Http\Controllers\Api;

use App\Adress;
use App\City;
use App\Customer;
use App\Http\Controllers\Controller;
use App\Neighborhood;
use App\Order;
use App\OrderProduct;
use App\PaymentMethod;
use App\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrdersController extends Controller
{
    public function quick(Request $request) {
        $request->validate([
            'phone_primary' => 'required',
            'number' => 'required',
            'payment_method_id' => 'required',
            'neighborhood_id' => 'required'
        ]);

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

        $adress = Adress::where('full_adress', $request->input('full_adress'))->where('customer_id', $customer->id)->first();
        if (!$adress) {
            $adress = new Adress;
        }
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
        $order->payment_method_id = $request->input('payment_method_id');
        $order->employee_id = 1;
        $order->status = "APROVADO";

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

    public function list(Request $request, $limit = 0) {
        $orders = Order::orderBy('id', 'DESC');

        if ($limit) {
            $orders = $orders->take($limit)->get();
        } else {
            $orders = $orders->get();
        }

        foreach ($orders as $order) {
            $order_products = OrderProduct::where('order_id', $order->id)->get();
            $order->total = 0.0;
            foreach ($order_products as $order_product) {
                $order_product->product = Product::find($order_product->product_id);
                $order_product->total = $order_product->product->value * $order_product->quantity;
                $order->total += $order_product->total;
            }
            $order->order_products = $order_products;

            $order->customer = Customer::find($order->customer_id);
            $order->payment_method = PaymentMethod::find($order->payment_method_id);
            $order->adress = Adress::find($order->adress_id);
            $order->adress->neighborhood = Neighborhood::find($order->adress->neighborhood_id);
            $order->adress->city = City::find($order->adress->neighborhood->city_id);
        }

        return new JsonResponse($orders, 200, ['Content-type'=> 'application/json; charset=utf-8'], JSON_UNESCAPED_UNICODE);
    }

    public function find(Request $request, $pedido_id) {
        $order = Order::findOrFail($pedido_id);

        $order->total = 0.0;
        $order_products = OrderProduct::where('order_id', $order->id)->get();
        foreach ($order_products as $order_product) {
            $order_product->product = Product::find($order_product->product_id);
            $order_product->total = $order_product->product->value * $order_product->quantity;
            $order->total += $order_product->total;
        }
        $order->order_products = $order_products;

        $order->customer = Customer::find($order->customer_id);
        $order->payment_method = PaymentMethod::find($order->payment_method_id);
        $order->adress = Adress::find($order->adress_id);
        $order->adress->neighborhood = Neighborhood::find($order->adress->neighborhood_id);
        $order->adress->city = City::find($order->adress->neighborhood->city_id);

        return view('cupon', ['order' => $order]);
    }

    public function changeStatus(Request $request) {
        $request->validate([
            'id' => 'required',
            'status' => 'required'
        ]);

        $order = Order::find($request->input('id'));
        $order->status = $request->input('status');
        $order->saveOrFail();

        return new JsonResponse($order, 200, ['Content-type'=> 'application/json; charset=utf-8'], JSON_UNESCAPED_UNICODE);
    }
}
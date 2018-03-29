<?php

namespace App\Http\Controllers\Api;

use App\Customer;
use App\Http\Controllers\Controller;
use App\Order;
use App\OrderProduct;
use App\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrdersController extends Controller
{
    public function quick(Request $request, $phone) {
        return new JsonResponse(['oi' => 'tchau']);

        $customer = Customer::where('phone_primary', $phone);

        if (!$customer) {
            $customer = new Customer;
        }

        $customer->name = $request->input('name');
        $customer->email = $request->input('email');
        $customer->phone_primary = $phone;
        $customer->phone_secondary = $request->input('phone_secondary');

        $customer->saveOrFail();
        
        $order = new Order;
        $order->customer_id = $customer->id;
        $order->employee_id = 1;
        $order->status = "FAZENDO";

        $order->saveOrFail();

        $products = $request['products'];

        for ($i = 0; $i < count($products); $i++) {
            $product = Product::where('id', $products[$i]['id'])->where('quantity', '>=', $products[$i]['quantity']);
            if ($product) {
                $product->quantity -= $products[$i]['quantity'];
                $product->saveOrFail();

                $productOrder = new OrderProduct;
                $productOrder->product_id = $product->id;
                $productOrder->order_id = $order->id;

                $productOrder->saveOrFail();
            }
        }


        return new JsonResponse(Order::all());
    }
}
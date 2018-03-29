<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductsController extends Controller
{
    public function list(Request $request) {
        return new JsonResponse(Product::all());
    }

    public function find(Request $request, $id) {
        return new JsonResponse(Product::find($id));
    }
}
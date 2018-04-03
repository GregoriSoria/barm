<?php

namespace App\Http\Controllers\Api;

use App\City;
use App\Http\Controllers\Controller;
use App\Neighborhood;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NeighborhoodsController extends Controller
{
    public function byCity(Request $request, $city_id) {
        return new JsonResponse(DB::table('neighborhoods')->where('city_id', $city_id)->orderBy('name')->get());
    }

    public function new(Request $request) {
        $request->validate([
            'long_name' => 'required',
            'city_id' => 'required'
        ]);
        $neighborhood = DB::select('SELECT * FROM neighborhoods WHERE lower(name) = "?" LIMIT 1', [strtolower($request->input('long_name'))]);

        if (count($neighborhood) == 0) {
            $neighborhood = new Neighborhood();

            $neighborhood->name = $request->input('long_name');
            $neighborhood->city_id = $request->input('city_id');

            $neighborhood->saveOrFail();
        } else {
            $neighborhood = $neighborhood[0];
        }

        return new JsonResponse($neighborhood, 200, ['Content-type'=> 'application/json; charset=utf-8'], JSON_UNESCAPED_UNICODE);
    }
}
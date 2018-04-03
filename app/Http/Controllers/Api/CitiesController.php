<?php

namespace App\Http\Controllers\Api;

use App\City;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CitiesController extends Controller
{
    public function byState(Request $request, $state_id) {
        return new JsonResponse(DB::table('cities')->where('state_id', $state_id)->orderBy('name')->get());
    }

    public function new(Request $request) {
        $request->validate([
            'long_name' => 'required',
            'state_id' => 'required'
        ]);

        $city = DB::select('SELECT * FROM cities WHERE lower(name) = "?" LIMIT 1', [strtolower($request->input('long_name'))]);

        if (count($city) == 0) {
            $city = new City();

            $city->name = $request->input('long_name');
            $city->state_id = $request->input('state_id');

            $city->saveOrFail();
        } else {
            $city = $city[0];
        }

        return new JsonResponse($city, 200, ['Content-type'=> 'application/json; charset=utf-8'], JSON_UNESCAPED_UNICODE);
    }
}
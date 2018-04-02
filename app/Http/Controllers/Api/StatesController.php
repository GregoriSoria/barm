<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\State;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatesController extends Controller
{
    public function list(Request $request) {
        return new JsonResponse(DB::table('states')->orderBy('name')->get());
    }

    public function new(Request $request) {
        $request->validate([
            'long_name' => 'required',
            'short_name' => 'required'
        ]);
        $state = DB::select('SELECT * FROM states WHERE lower(name) = ? LIMIT 1', [strtolower($request->input('long_name'))]);

        if (count($state) == 0) {
            $state = new State();

            $state->name = $request->input('long_name');
            $state->slug = $request->input('short_name');

            $state->saveOrFail();
        } else {
            $state = $state[0];
        }

        return new JsonResponse($state);
    }
}
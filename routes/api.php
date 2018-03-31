<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::group(['namespace' => 'Api', 'prefix' => 'api'], function () {
    Route::group(['prefix' => 'products'], function () {
        Route::get('/', 'ProductsController@list');
        Route::post('/', 'ProductsController@store');
        Route::put('/{id}', 'ProductsController@store');
        Route::get('/{id}', 'ProductsController@find');
    });

    Route::group(['prefix' => 'customers'], function () {
        Route::get('/byPhone/{phone}', 'CustomersController@byPhone');
    });

    Route::group(['prefix' => 'orders'], function () {
        Route::post('/quick', 'OrdersController@quick');
    });
});
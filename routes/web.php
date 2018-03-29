<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});


Route::group(['prefix' => 'admin'], function () {
    Voyager::routes();

    Route::group(['middleware' => 'admin.user', 'as' => 'admin.'], function () {
        Route::get('/quick-order', function () {
            return view('quick-order');
        });
    });
});

Route::group(['namespace' => 'Api', /*'middleware' => 'admin.user',*/ 'prefix' => 'api'], function () {
    Route::group(['prefix' => 'products'], function () {
        Route::get('/', 'ProductsController@list');
        Route::post('/', 'ProductsController@store');
        Route::put('/{id}', 'ProductsController@store');
        Route::get('/{id}', 'ProductsController@find');
    });

    Route::group(['prefix' => 'orders'], function () {
        Route::post('/{phone}', 'OrdersController@quick');
    });
});

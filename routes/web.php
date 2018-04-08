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


Route::group(['prefix' => 'admin'], function () {
    Voyager::routes();

    Route::group(['middleware' => 'admin.user'], function () {
        Route::get('/quick-order', function () {
            return view('quick-order');
        });

        Route::get('/pedidos', function () {
            return view('orders');
        });
    });
});


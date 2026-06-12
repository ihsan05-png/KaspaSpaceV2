<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\{ProductTypeController, RoomController, VoPackageController, BookingController, FnbController, BizController, OvertimeController, GoogleReviewsController, AvailabilityController, PublicSettingsController, DiscountController, DocumentUploadController, ReviewController, ArticleController, MidtransController};
use App\Http\Controllers\Admin\{AdminRoomController, AdminProductTypeController, AdminBookingController, AdminFnbController, AdminBizController, AdminVoController, AdminOvertimeController, AdminUserController, AdminSettingsController, AdminDiscountController, AdminReviewController, AdminArticleController};
use Illuminate\Support\Facades\Route;

// ── Auth ─────────────────────────────────────────────────────
Route::controller(AuthController::class)->prefix('auth')->group(function () {
    Route::post('register', 'register');
    Route::post('login',    'login');
    Route::post('logout',   'logout');
    Route::get('user',      'user');
});

// ── Public API ───────────────────────────────────────────────
Route::prefix('api')->group(function () {

    Route::get('product-types',             [ProductTypeController::class, 'index']);
    Route::get('rooms',                     [RoomController::class, 'index']);
    Route::get('rooms/{room}/availability', [RoomController::class, 'availability']);
    Route::get('vo-packages',               [VoPackageController::class, 'index']);
    Route::get('fnb/items',                 [FnbController::class, 'items']);
    Route::get('biz/services',              [BizController::class, 'services']);
    Route::get('overtime/schedules',        [OvertimeController::class, 'schedules']);
    Route::get('google-reviews',            [GoogleReviewsController::class, 'index']);
    Route::get('availability/today',        [AvailabilityController::class, 'today']);
    Route::get('availability/schedule',     [AvailabilityController::class, 'schedule']);
    Route::get('availability/matrix',       [AvailabilityController::class, 'matrix']);
    Route::get('settings/operational-hours',[PublicSettingsController::class, 'operationalHours']);
    Route::get('settings/ppn',              [PublicSettingsController::class, 'ppn']);
    Route::get('settings/payment-methods', [PublicSettingsController::class, 'paymentMethods']);
    Route::get('locations',                 [PublicSettingsController::class, 'locations']);
    Route::get('discounts',                 [DiscountController::class, 'active']);
    Route::post('discounts/validate',       [DiscountController::class, 'validate']);
    Route::get('reviews',                   [ReviewController::class, 'index']);
    Route::get('articles',                  [ArticleController::class, 'index']);
    Route::get('articles/{slug}',           [ArticleController::class, 'show']);

    // Midtrans payment
    Route::post('payments/midtrans/token',        [MidtransController::class, 'token']);
    Route::post('payments/midtrans/notification', [MidtransController::class, 'notification']);

    // Booking — POST & GET by code public (guest support), others require auth
    Route::post('bookings',                    [BookingController::class, 'store']);
    Route::get('bookings/track/{code}',        [BookingController::class, 'track']);
    Route::patch('bookings/cancel/{code}',     [BookingController::class, 'cancelByCode']);
    Route::post('fnb/orders',                  [FnbController::class, 'order']);
    Route::get('fnb/orders/track/{code}',      [FnbController::class, 'track']);
    Route::patch('fnb/orders/cancel/{code}',   [FnbController::class, 'cancelOrder']);
    Route::post('biz/orders',                  [BizController::class, 'order']);
    Route::get('biz/orders/track/{code}',      [BizController::class, 'track']);
    Route::patch('biz/orders/cancel/{code}',   [BizController::class, 'cancelOrder']);

    // Auth-required
    Route::middleware('auth')->group(function () {
        Route::get('bookings',                    [BookingController::class, 'index']);
        Route::get('bookings/{booking}',          [BookingController::class, 'show']);
        Route::patch('bookings/{booking}/cancel', [BookingController::class, 'cancel']);
        Route::get('biz/orders',                  [BizController::class, 'myOrders']);
        Route::get('fnb/orders',                  [FnbController::class, 'myOrders']);
        Route::post('upload/document',            [DocumentUploadController::class, 'store']);
        Route::get('reviews/eligibility',         [ReviewController::class, 'eligibility']);
        Route::post('reviews',                    [ReviewController::class, 'store']);
    });

    // Admin-only
    Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {

        // Rooms & desks
        Route::get('rooms',                                    [AdminRoomController::class, 'index']);
        Route::post('rooms',                                   [AdminRoomController::class, 'store']);
        Route::put('rooms/{room}',                             [AdminRoomController::class, 'update']);
        Route::delete('rooms/{room}',                          [AdminRoomController::class, 'destroy']);
        Route::post('rooms/{room}/desks',                      [AdminRoomController::class, 'addDesk']);
        Route::put('rooms/{room}/desks/{desk}',                [AdminRoomController::class, 'updateDesk']);
        Route::delete('rooms/{room}/desks/{desk}',             [AdminRoomController::class, 'removeDesk']);

        // Product types
        Route::get('product-types',                            [AdminProductTypeController::class, 'index']);
        Route::post('product-types',                           [AdminProductTypeController::class, 'store']);
        Route::put('product-types/{productType}',              [AdminProductTypeController::class, 'update']);
        Route::delete('product-types/{productType}',           [AdminProductTypeController::class, 'destroy']);

        // Bookings
        Route::get('bookings',                                 [AdminBookingController::class, 'index']);
        Route::get('bookings/stats',                           [AdminBookingController::class, 'stats']);
        Route::get('transactions/recent',                      [AdminBookingController::class, 'recentTransactions']);
        Route::get('bookings/{booking}',                       [AdminBookingController::class, 'show']);
        Route::patch('bookings/{booking}/status',              [AdminBookingController::class, 'updateStatus']);
        Route::delete('bookings/{booking}',                    [AdminBookingController::class, 'destroy']);

        // FnB
        Route::get('fnb/items',                                [AdminFnbController::class, 'index']);
        Route::post('fnb/items',                               [AdminFnbController::class, 'store']);
        Route::put('fnb/items/{fnbItem}',                      [AdminFnbController::class, 'update']);
        Route::delete('fnb/items/{fnbItem}',                   [AdminFnbController::class, 'destroy']);
        Route::get('fnb/orders',                               [AdminFnbController::class, 'orders']);
        Route::patch('fnb/orders/{order}/status',              [AdminFnbController::class, 'updateOrderStatus']);

        // Business service
        Route::get('biz/services',                             [AdminBizController::class, 'index']);
        Route::post('biz/services',                            [AdminBizController::class, 'store']);
        Route::put('biz/services/{bizService}',                [AdminBizController::class, 'update']);
        Route::delete('biz/services/{bizService}',             [AdminBizController::class, 'destroy']);
        Route::get('biz/orders',                               [AdminBizController::class, 'orders']);
        Route::patch('biz/orders/{order}/status',              [AdminBizController::class, 'updateOrderStatus']);

        // Virtual office
        Route::get('vo/packages',                              [AdminVoController::class, 'packages']);
        Route::post('vo/packages',                             [AdminVoController::class, 'storePackage']);
        Route::put('vo/packages/{voPackage}',                  [AdminVoController::class, 'updatePackage']);
        Route::delete('vo/packages/{voPackage}',               [AdminVoController::class, 'destroyPackage']);
        Route::get('vo/bundles',                               [AdminVoController::class, 'bundles']);
        Route::post('vo/bundles',                              [AdminVoController::class, 'storeBundle']);
        Route::put('vo/bundles/{voBundle}',                    [AdminVoController::class, 'updateBundle']);
        Route::delete('vo/bundles/{voBundle}',                 [AdminVoController::class, 'destroyBundle']);

        // Overtime
        Route::get('overtime-schedules',                       [AdminOvertimeController::class, 'index']);
        Route::post('overtime-schedules',                      [AdminOvertimeController::class, 'store']);
        Route::put('overtime-schedules/{overtimeSchedule}',    [AdminOvertimeController::class, 'update']);
        Route::delete('overtime-schedules/{overtimeSchedule}', [AdminOvertimeController::class, 'destroy']);

        // Users
        Route::get('users',                                    [AdminUserController::class, 'index']);
        Route::get('users/{user}',                             [AdminUserController::class, 'show']);
        Route::post('users/{user}/send-email',                 [AdminUserController::class, 'sendEmail']);
        Route::get('stats',                                    [AdminBookingController::class, 'stats']);

        // Upload
        Route::post('upload',                                  [\App\Http\Controllers\Admin\AdminUploadController::class, 'store']);

        // Reviews
        Route::get('reviews',                                  [AdminReviewController::class, 'index']);
        Route::patch('reviews/{review}/status',                [AdminReviewController::class, 'updateStatus']);
        Route::delete('reviews/{review}',                      [AdminReviewController::class, 'destroy']);

        // Articles
        Route::get('articles',                                 [AdminArticleController::class, 'index']);
        Route::post('articles',                                [AdminArticleController::class, 'store']);
        Route::put('articles/{article}',                       [AdminArticleController::class, 'update']);
        Route::delete('articles/{article}',                    [AdminArticleController::class, 'destroy']);

        // Discounts
        Route::get('discounts',                                [AdminDiscountController::class, 'index']);
        Route::post('discounts',                               [AdminDiscountController::class, 'store']);
        Route::put('discounts/{discount}',                     [AdminDiscountController::class, 'update']);
        Route::delete('discounts/{discount}',                  [AdminDiscountController::class, 'destroy']);

        // Settings
        Route::get('settings',                                 [AdminSettingsController::class, 'index']);
        Route::post('settings/operational-hours',              [AdminSettingsController::class, 'updateOperationalHours']);
        Route::put('settings/locations',                       [AdminSettingsController::class, 'updateLocations']);
        Route::post('settings/system',                         [AdminSettingsController::class, 'updateSystem']);
        Route::get('settings/payment-methods',                 [AdminSettingsController::class, 'getPaymentMethods']);
        Route::put('settings/payment-methods',                 [AdminSettingsController::class, 'updatePaymentMethods']);
        Route::get('settings/midtrans',                        [AdminSettingsController::class, 'getMidtrans']);
        Route::put('settings/midtrans',                        [AdminSettingsController::class, 'updateMidtrans']);
    });
});

// ── React SPA catch-all ──────────────────────────────────────
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

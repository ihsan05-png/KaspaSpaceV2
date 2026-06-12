<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'sheets_id' => env('GOOGLE_SHEETS_ID'),
        'maps_url'  => 'https://www.google.com/maps/place/Coworking+%26+Virtual+Office+-+Kaspa+Space+Manahan/@-7.5611401,110.6555759,20z/data=!4m8!3m7!1s0x2e7a150836ddfc5f:0x6a0a0e823bb991f2!8m2!3d-7.5543959!4d110.8008344!9m1!1b1!16s%2Fg%2F11y82l07jk',
    ],

];

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name'     => 'Admin Kaspa',
                'email'    => 'admin@kaspaspace.id',
                'phone'    => '08112345678',
                'role'     => 'admin',
                'password' => Hash::make('admin123'),
            ],
            [
                'name'     => 'Kevin Virdianto',
                'email'    => 'kevin@email.com',
                'phone'    => '08123456789',
                'role'     => 'user',
                'password' => Hash::make('password'),
            ],
            [
                'name'     => 'Sari Wulandari',
                'email'    => 'sari@email.com',
                'phone'    => '08134567890',
                'role'     => 'user',
                'password' => Hash::make('password'),
            ],
            [
                'name'     => 'Ahmad Faisal',
                'email'    => 'ahmad@email.com',
                'phone'    => '08145678901',
                'role'     => 'user',
                'password' => Hash::make('password'),
            ],
            [
                'name'     => 'Rina Pertiwi',
                'email'    => 'rina@email.com',
                'phone'    => '08156789012',
                'role'     => 'user',
                'password' => Hash::make('password'),
            ],
        ];

        foreach ($users as $data) {
            User::firstOrCreate(['email' => $data['email']], $data);
        }
    }
}

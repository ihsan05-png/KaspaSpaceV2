<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::orderByDesc('created_at');
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        return response()->json($query->paginate(20));
    }

    public function show(User $user)
    {
        return response()->json($user->loadCount('bookings'));
    }

    public function sendEmail(Request $request, User $user)
    {
        $data = $request->validate([
            'subject'    => 'required|string|max:200',
            'message'    => 'required|string|max:5000',
            'attachment' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,gif,pdf,doc,docx',
        ]);

        $attachPath  = null;
        $attachName  = null;
        if ($request->hasFile('attachment')) {
            $file       = $request->file('attachment');
            $attachPath = $file->getRealPath();
            $attachName = $file->getClientOriginalName();
        }

        Mail::send([], [], function ($mail) use ($user, $data, $attachPath, $attachName) {
            $mail->to($user->email, $user->name)
                 ->subject($data['subject'])
                 ->html(
                     '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">'
                   . '<h2 style="color:#1a1a2e">KaspaSpace</h2>'
                   . '<p style="font-size:15px;color:#333;line-height:1.7">' . nl2br(e($data['message'])) . '</p>'
                   . '<hr style="border:none;border-top:1px solid #eee;margin:24px 0">'
                   . '<p style="font-size:12px;color:#999">Email ini dikirim oleh admin KaspaSpace.</p>'
                   . '</div>'
                 );

            if ($attachPath && $attachName) {
                $mail->attach($attachPath, ['as' => $attachName]);
            }
        });

        return response()->json(['message' => 'Email berhasil dikirim ke ' . $user->email]);
    }
}

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// تقديم ملفات الواجهة من المجلد الحالي
app.use(express.static(__dirname));

// إدارة اتصالات المستخدمين
io.on('connection', (socket) => {
    // استقبال معرف المستخدم (User ID) عند الدخول
    socket.on('join-room', (userId) => {
        socket.userId = userId;
        // إبلاغ بقية المستخدمين بدخول مستخدم جديد ومشاركة الـ ID الخاص به
        socket.broadcast.emit('user-connected', userId, socket.id);
        console.log(`المستخدم ${userId} اتصل الآن بالسيرفر.`);
    });

    // تبادل رسائل النصية في الشات اللايف
    socket.on('send-message', (data) => {
        io.emit('receive-message', data);
    });

    // تبادل إشارات الـ WebRTC للصوت (توجيه العرض والقبول)
    socket.on('signal', (data) => {
        io.to(data.toSocketId).emit('signal', {
            fromSocketId: socket.id,
            fromUserId: socket.userId,
            signal: data.signal
        });
    });

    // عند خروج المستخدم
    socket.on('disconnect', () => {
        io.emit('user-disconnected', socket.id);
        console.log(`انفصل مستخدم عن السيرفر.`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`السيرفر يعمل على الرابط: http://localhost:${PORT}`);
});

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String, 
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type:String,
        required: true
    },
    avatar: {
        type:String,
        default: 'https://i2.wp.com/vdostavka.ru/wp-content/uploads/2019/05/no-avatar.png?fit=512%2C512&ssl=1'
    }
});
//збережені пости, пости, підписки, лайки, коменти, date
module.exports = User = mongoose.model("user", UserSchema);
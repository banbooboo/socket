var fs = require('fs')
    , http = require('http')
    , socketio = require('socket.io');
var MongoClient = require('mongodb').MongoClient;//mongodb


var server = http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-type': 'text/html'});
    res.end('hello');
}).listen(8082, function() {
    console.log('Listening at: http://localhost:8082');
});
var userarr=[];
var userindex;
var nickname;
var collection;
var talkindex=0;
var DB_CONN_STR = 'mongodb://localhost:27017/ihelpiTalkRoom'; //数据库为 talkDate

//mongod是否连接成功
MongoClient.connect(DB_CONN_STR, function(err, db) {
        if(err){
            console.log(err);
            return;
        }
        console.log("连接成功！");
        collection = db.collection('talkDate');
});


socketio.listen(server).on('connection',function(socket){        
        socket.on('user join',function(data){

       	if(userarr.indexOf(data.user)<0){
       		userindex=data.length;
       		nickname=data.user;
       		userarr.push(data.user);
       		socket.broadcast.emit('chat message',{ type:0,msg:'欢迎'+data.user+"进入聊天室",
			user:data.user });
       	}else{
       		socket.emit('nickExisted',{msg:1});

       	}

	});
	socket.on('chat message',function(data){
		var time=new Date();
		socket.broadcast.emit('chat message',{type:data.type,msg:data.msg,
			user:data.user,to:data.to,time:time.getTime(),counter:userarr.length,
			users:userarr});
		socket.emit(data.user+'send success',{msg:data.msg,time:time.getTime(),type:data.type});


    //插入数据
    var dataObj = [{"user":data.user,"date":data.msg,"type":data.type,"to":data.to
                    ,"time":time.getTime()}];
    collection.insert(dataObj, function(err, result) { 
        if(err)
        {
            console.log('Error:'+ err);
            return;
        }    
       
    });


	});
	socket.on('disconnect', function() {
    //将断开连接的用户从users中删除
    userarr.splice(userindex, 1);
    //通知除自己以外的所有人
    socket.broadcast.emit('chat message',{type:3,msg:nickname+'离开'});
  });

})





importScripts('/controller.sw.js');
self.addEventListener('fetch',event=>{
 if(self.$__90638Controller.shouldRoute(event)) event.respondWith(self.$__90638Controller.route(event));
});

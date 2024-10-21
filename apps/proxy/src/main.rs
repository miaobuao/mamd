use async_trait::async_trait;
use pingora::prelude::*;
use std::env;

pub struct SimpleProxy;

#[async_trait]
impl ProxyHttp for SimpleProxy {
    type CTX = ();
    fn new_ctx(&self) -> () {
        ()
    }

    async fn upstream_peer(&self, session: &mut Session, _ctx: &mut ()) -> Result<Box<HttpPeer>> {
        let path = session.req_header().uri.path();
        let sni = if path.starts_with("/oss/") {
            env::var("PROXY_MINIO_UPSTREAM").unwrap()
        } else {
            env::var("PROXY_WEB_UPSTREAM").unwrap()
        };
        let peer = Box::new(HttpPeer::new(sni.clone(), false, sni));
        Ok(peer)
    }
}

fn main() {
    let mut my_server = Server::new(None).unwrap();
    my_server.bootstrap();

    let mut proxy_service = http_proxy_service(&my_server.configuration, SimpleProxy);
    let addr = format!("0.0.0.0:{}", env::var("PROXY_PORT").unwrap());
    proxy_service.add_tcp(addr.as_str());

    my_server.add_service(proxy_service);

    println!("proxy server running on http://{}", addr);

    my_server.run_forever();
}
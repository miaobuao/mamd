use async_trait::async_trait;
use pingora::prelude::*;
use std::sync::Arc;
use std::env;

pub struct LB(Arc<LoadBalancer<RoundRobin>>);

#[async_trait]
impl ProxyHttp for LB {

    type CTX = ();
    fn new_ctx(&self) -> () {
        ()
    }

    async fn upstream_peer(&self, session: &mut Session, _ctx: &mut ()) -> Result<Box<HttpPeer>> {
        let upstream = self.0
            .select(b"", 256)
            .unwrap();
        let sni = if session.req_header().uri.path().starts_with("/oss/") {
            println!("upstream: {}", session.req_header().uri.path());
            env::var("PROXY_MINIO_UPSTREAMS").unwrap()
        } else {
            env::var("PROXY_WEB_UPSTREAMS").unwrap()
        };
        let peer = Box::new(HttpPeer::new(upstream, false, sni));
        Ok(peer)
    }
}

fn main() {
    let mut my_server = Server::new(None).unwrap();
    my_server.bootstrap();

    let upstreams =
    LoadBalancer::try_from_iter([
        env::var("PROXY_WEB_UPSTREAMS").unwrap(),
        env::var("PROXY_MINIO_UPSTREAMS").unwrap(),
    ]).unwrap();

    let mut lb = http_proxy_service(&my_server.configuration, LB(Arc::new(upstreams)));
    lb.add_tcp("0.0.0.0:6188");

    my_server.add_service(lb);

    my_server.run_forever();
}

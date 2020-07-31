Udemy 강의(Node.js(Advanced Concepts)) 들은 후 Redis를 Caching 하는 용도로 사용
하는 법 정리

-cache.js(services/) -blogRoutes.js(routes/)

Redis -In-Memory Data Structure Store (인메모리 구조이지만, 시스템이 종료되어도
영속성이 유지되는 특징 + 캐싱 서버로서 미들웨어처럼 사용)

Caching시 고려해야 할 문제와 그 해결 법.

1.Caching code isn't easily reusable anywhere else in our codebase -> Hook in to
Mongoose's query generation and execution process

2. Cached values never expire -> Add timeout to values assigned to redis. Also
   add ability to reset all values tied to some specific event
3. Cached keys won't work when we introduce other collections or query options
   -> Figure out a more robust solution for generating cache keys

-Redis 사용의 이점

1. 데이터베이스에 Read해서 Fetch 하는 연산은 디스크에서 데이터를 꺼내오는 과정이
   기 때문에 많은 부하 발생
   - key-value 형태로 Redis에 캐싱을 해서 반복되는 read 연산의 부하를 줄임.
2. DB에서 인덱스를 사용하는 것은, 어떤 부분을 인덱싱 할지 ambigous 한 측면이 있
   음(해당 모델의 에트리뷰트들 중에서 어떤 것을 인댁싱 할지혹은 인댁싱을 할지라
   도 다른 에트리뷰트를 이용해서 조회하려는 경우도 발생 )
   - Redis는 kev-value 형식이라 key만 consistent 하고 unique 하게 설정해주면 이
     러한 문제를 해결 가능.

-Redis 사용 -시스템 내에서 Redis를 설치해야 하며, 레디스 서버를 가동한 상태로 사
용해야 함.

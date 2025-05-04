// src/services/api.ts

/**
 * 사용자 로그인 함수
 * @param email 사용자 이메일
 * @param password 사용자 비밀번호
 * @returns Promise<boolean> 로그인 성공 여부
 */
export const loginUser = async (email: string, password: string): Promise<boolean> => {
    try {
        const response = await fetch('/api/users/login', { // 프록시 설정이 되어 있다고 가정
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
        // 로그인 실패 시 에러 처리 (예: 응답 본문에서 에러 메시지 파싱)
        const errorData = await response.json().catch(() => ({})); // 에러 응답이 JSON이 아닐 수도 있음
        console.error('Login failed:', response.status, errorData.message || 'Unknown error');
        // 필요시 사용자에게 알림
        return false;
        }

        // 응답 헤더에서 Authorization 토큰 추출
        const token = response.headers.get('Authorization');

        if (token) {
        // 토큰을 localStorage에 저장 (실제 애플리케이션에서는 더 안전한 방법 고려)
        localStorage.setItem('authToken', token);
        console.log('Login successful, token stored.');
        return true;
        } else {
        console.error('Login successful, but no Authorization token received in header.');
        // 토큰이 응답 본문에 있는지 확인해야 할 수도 있음
        // const responseData = await response.json();
        // if (responseData.result && responseData.result.token) { ... }
        return false;
        }
    } catch (error) {
        console.error('Error during login request:', error);
        return false;
    }
    };

    /**
     * 인증 토큰을 포함하여 API 요청을 보내는 함수
     * @param url 요청할 URL (예: /api/trip-plans/14/attractions)
     * @param options fetch 옵션 (method, body 등)
     * @returns Promise<Response> fetch 응답 객체
     */
    export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    // <<---!!! 개발용 임시 코드 시작 !!!--->>
    // 1. 여기에 발급받은 실제 JWT 토큰 문자열을 붙여넣으세요.
    const hardcodedToken = "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0NjMyNDc2OCwiZXhwIjoxNzQ2NDExMTY4fQ.Z0pAUNOA_YcAZaFm7zvM7wB8h6Kjb4E4WHcioJxaSU77u9bLeer-kagNpnjkBdTL9LGIweGhL0feCATpXCro0w ";
    // const token = localStorage.getItem('authToken'); // 원래 코드 주석 처리
    const token = hardcodedToken; // 임시로 하드코딩된 토큰 사용
    // <<---!!! 개발용 임시 코드 끝 !!!--->>

    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    } else {
        // 이 부분은 하드코딩된 토큰이 유효하다면 실행되지 않을 것입니다.
        console.error('Hardcoded token is missing or empty.');
        throw new Error('Authentication required (Hardcoded token missing)');
    }

    const response = await fetch(url, {
        ...options,
        headers: headers,
    });

    // 401 에러 처리는 여전히 유효할 수 있습니다 (하드코딩된 토큰이 잘못되었거나 만료된 경우)
    if (response.status === 401) {
        console.error('Authentication failed (401) even with hardcoded token.');
        // localStorage.removeItem('authToken'); // localStorage를 사용하지 않으므로 이 줄은 필요 없을 수 있음
        // throw new Error('Unauthorized (Hardcoded token invalid)');
    }

    return response;
    };
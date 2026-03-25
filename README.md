# PulseGrid (서버 모니터링 시스템 - Java 버전)

PulseGrid는 중소규모 인프라의 상태를 실시간으로 감시하고, 문제 발생 시 즉시 알림을 제공하는 **서버 모니터링 시스템**입니다. 현재 이 저장소는 Java(Spring Boot)와 Gradle을 기반으로 구동되는 백엔드와 React 프론트엔드로 구성되어 있습니다.

## 🚀 주요 기능

### 1. 실시간 서버 상태 감시 (Multi-Protocol Monitoring)
다양한 프로토콜을 사용하여 서버 시스템의 하트비트(Pulse)를 체크합니다.
- **PING (ICMP/TCP)**: 기본적인 네트워크 가용성 체크
- **HTTP/HTTPS**: 웹 서비스 응답 속도 및 상태 코드 모니터링
- **SSH**: 원격 접속 가능 여부 및 서버 생존 확인
- **Redfish**: 서버 하드웨어 관리 인터페이스 연동

### 2. 즉각적인 장애 알림 시스템
상태 변화 감지 시 설정된 채널로 즉시 알림을 발송합니다.
- **Webhook 지원**: Slack, Discord, Telegram 연동
- **이메일 알림**: 알림 발생 시 상세 내역 발송

### 3. 직관적인 대시보드 (Admin & User)
- **그리드형 레이아웃**: Tailwind CSS 기반의 세련된 그리드 UI로 전체 서버 상태를 한눈에 파악
- **티어별 관리**: Free(3개 서버) / PRO(10개 서버) 플랜에 따른 유연한 리소스 제한
- **다크 모드**: 눈의 피로도를 낮추는 모던한 다크 테마 지원
- **현지 시간 반영**: 사용자 타임존에 맞춘 정확한 로그 타임스탬프 표시

## 🛠 기술 스택

- **Backend**: Java 17+, Spring Boot, Gradle, Spring Security (JWT)
- **Frontend**: React, Tailwind CSS, Lucide React, Vite
- **Auth**: JWT (JSON Web Token) 기반 인증 및 역할 관리(User, Admin)
- **Database**: JPA/Hibernate (MySQL/MariaDB 지원)

## 📦 시작하기 (로컬 실행)

### Backend (Spring Boot)
1. `./gradlew bootRun` 명령어를 통해 백엔드 서버를 실행합니다.
2. 기본 포트는 `8080`입니다.

### Frontend (React)
1. `frontend` 폴더로 이동합니다.
2. `npm install` 후 `npm run dev`를 실행합니다.

## 📜 프로젝트 구조
- `src/main/java`: Spring Boot 백엔드 소스 코드
- `src/main/resources`: 설정 파일 및 정적 리소스
- `frontend/`: React 기반 웹 대시보드
- `build.gradle`: 프로젝트 빌드 및 의존성 관리 설정

---
**PulseGrid**: 모든 서버의 맥박을 하나의 그리드에서 관리하세요.

import client from "./client";

export const contractApi = {
  // 계약서 업로드
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file); 

    // client.ts의 BASE_URL 설정을 고려하여 경로를 작성합니다.
    // 만약 에러가 404로 바뀌면 '/contracts/upload'로 수정해보세요.
    const response = await client.post('/api/v1/contracts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 상태 확인
  getStatus: async (contractId) => {
    const response = await client.get(`/api/v1/contracts/${contractId}/status`);
    return response.data;
  }
};
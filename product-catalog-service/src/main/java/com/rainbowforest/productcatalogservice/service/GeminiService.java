package com.rainbowforest.productcatalogservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class GeminiService {

    // Using the API Key provided by the user
    private final String API_KEY = "AIzaSyB6R6xsUyXXMj_O_QaMl3CzJ1K7oUkCU2Q";
    private final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY;

    @Autowired
    private ProductRepository productRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String chatWithBot(String userMessage) {
        try {
            // 1. Fetch products from DB to provide context to the AI
            List<Product> products = productRepository.findAll();
            StringBuilder contextBuilder = new StringBuilder();
            contextBuilder.append("DANH SÁCH SẢN PHẨM HIỆN CÓ CỦA CỬA HÀNG:\n");
            
            for (Product p : products) {
                contextBuilder.append(String.format("- ID: %d | Tên: %s | Giá: %s VNĐ | Link ảnh: %s | Mô tả: %s\n",
                        p.getId(),
                        p.getProductName(),
                        p.getPrice().multiply(new java.math.BigDecimal(1000)), // format price to match frontend
                        p.getImageUrl(),
                        p.getDiscription()));
            }

            // 2. Build the System Prompt
            String systemInstruction = "Bạn là trợ lý ảo tư vấn bán hàng của cửa hàng mô hình PREMIUM STORE. " +
                    "Luôn xưng hô là 'Dạ', 'Em' và gọi khách hàng là 'Anh/Chị' hoặc 'Bạn'. " +
                    "Nhiệm vụ của bạn là tư vấn dựa trên danh sách sản phẩm cửa hàng đang có. " +
                    "Nếu khách hàng hỏi mua sản phẩm có trong danh sách, hãy cung cấp thông tin, báo giá và LUÔN LUÔN làm 2 việc: 1. Chèn hình ảnh của sản phẩm theo cú pháp Markdown: ![Tên SP](URL ảnh). 2. Cung cấp đường dẫn link để khách hàng xem chi tiết theo định dạng Markdown: [Xem chi tiết sản phẩm](/product/ID_SẢN_PHẨM) (thay ID_SẢN_PHẨM bằng ID tương ứng). " +
                    "Nếu khách hỏi sản phẩm không có, hãy khéo léo xin lỗi và gợi ý các sản phẩm khác có trong danh sách. " +
                    "Không bịa đặt sản phẩm hoặc giá cả không có trong danh sách.";

            String fullPrompt = systemInstruction + "\n\n" + contextBuilder.toString() + "\n\nKhách hàng nói: " + userMessage;

            // 3. Build JSON request body for Gemini API
            ObjectNode requestBody = objectMapper.createObjectNode();
            ArrayNode contents = requestBody.putArray("contents");
            ObjectNode content = contents.addObject();
            ArrayNode parts = content.putArray("parts");
            ObjectNode part = parts.addObject();
            part.put("text", fullPrompt);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody.toString(), headers);

            // 4. Call API
            ResponseEntity<String> responseEntity = restTemplate.postForEntity(API_URL, requestEntity, String.class);

            // 5. Parse Response
            JsonNode rootNode = objectMapper.readTree(responseEntity.getBody());
            JsonNode candidates = rootNode.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode contentNode = firstCandidate.path("content");
                JsonNode partsNode = contentNode.path("parts");
                if (partsNode.isArray() && partsNode.size() > 0) {
                    return partsNode.get(0).path("text").asText();
                }
            }

            return "Xin lỗi, hiện tại hệ thống AI đang bận. Vui lòng thử lại sau ạ!";

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            e.printStackTrace();
            System.err.println("Gemini API Error: " + e.getResponseBodyAsString());
            return "Lỗi từ Gemini API: " + e.getResponseBodyAsString();
        } catch (Exception e) {
            e.printStackTrace();
            return "Xin lỗi, đã xảy ra lỗi trong quá trình kết nối với AI: " + e.getMessage();
        }
    }
}

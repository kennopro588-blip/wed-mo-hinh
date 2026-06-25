# BÁO CÁO TIẾN ĐỘ THỰC HIỆN DỰ ÁN
## ĐỀ TÀI: XÂY DỰNG HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ PHÂN TÁN (MICROSERVICES E-COMMERCE PLATFORM)
### THỜI GIAN THỰC HIỆN: 3 TUẦN (CHI TIẾT VÀ TOÀN DIỆN)

---

## MỤC LỤC
1. **PHẦN I: TỔNG QUAN DỰ ÁN & KIẾN TRÚC HỆ THỐNG**
   - 1.1. Đặt vấn đề và Mục tiêu dự án
   - 1.2. Sơ đồ kiến trúc Microservices phân tán
   - 1.3. Tổng quan các dịch vụ thành phần (Services) và Công nghệ sử dụng
2. **PHẦN II: TIẾN ĐỘ THỰC HIỆN CHI TIẾT TRONG 3 TUẦN**
   - 2.1. **TUẦN 1**: Khởi tạo hạ tầng, Eureka Server, API Gateway, Phân hệ Xác thực Người dùng & Giao diện Cơ bản
   - 2.2. **TUẦN 2**: Phát triển Catalog Sản phẩm, Hệ thống Gợi ý (Recommendation), Giỏ hàng, Đánh giá (Reviews) & AI Chatbot
   - 2.3. **TUẦN 3**: Tích hợp Cổng thanh toán VNPay, Đơn hàng, Hệ thống Điểm thưởng Khách hàng thân thiết (Loyalty Points), Vòng quay may mắn (Lucky Wheel) & Kiểm thử Tích hợp
3. **PHẦN III: THIẾT KẾ CƠ SỞ DỮ LIỆU & CẤU HÌNH HỆ THỐNG**
   - 3.1. Các Cơ sở dữ liệu độc lập (Database per Service)
   - 3.2. Sơ đồ thực thể chính (Entities) và các bảng dữ liệu
4. **PHẦN IV: ĐÁNH GIÁ KẾT QUẢ ĐẠT ĐƯỢC & HƯỚNG PHÁT TRIỂN**
   - 4.1. Đánh giá Ưu và Nhược điểm của hệ thống
   - 4.2. Hướng phát triển tiếp theo

---

# PHẦN I: TỔNG QUAN DỰ ÁN & KIẾN TRÚC HỆ THỐNG

### 1.1. Đặt vấn đề và Mục tiêu dự án
Trong kỷ nguyên số hóa, các hệ thống thương mại điện tử (E-Commerce) đòi hỏi khả năng xử lý lượng truy cập khổng lồ, tính sẵn sàng cao và khả năng mở rộng linh hoạt. Kiến trúc nguyên khối (Monolith) truyền thống bộc lộ nhiều hạn chế khi hệ thống phình to: khó nâng cấp công nghệ, rủi ro sập toàn bộ hệ thống khi một module gặp lỗi, và chu kỳ phát hành sản phẩm chậm.

Để giải quyết triệt để các vấn đề trên, dự án này đã lựa chọn thiết kế hệ thống theo **Kiến trúc Microservices** (Dịch vụ phân tán). Mỗi phân hệ nghiệp vụ được tách biệt thành một service chạy độc lập, sở hữu cơ sở dữ liệu riêng, và giao tiếp với nhau thông qua mạng nội bộ hoặc giao thức RESTful API.

**Mục tiêu chính của dự án:**
* Xây dựng một trang web thương mại điện tử chuyên nghiệp, giao diện hiện đại, mượt mà và trực quan.
* Thiết lập một hạ tầng phân tán vững chắc với Eureka Service Discovery và API Gateway để điều phối lưu lượng.
* Hiện thực hóa các nghiệp vụ thương mại cốt lõi: Quản lý sản phẩm, gợi ý thông minh, giỏ hàng, quản lý đơn hàng.
* Tích hợp thanh toán điện tử an toàn thông qua cổng **VNPay Sandbox**.
* Tăng cường tương tác khách hàng thông qua **Hệ thống Điểm tích lũy (Loyalty Points)**, mini-game **Vòng quay may mắn (Lucky Wheel)**, phân hệ **Đánh giá (Review)** và **Trợ lý ảo AI Chatbot**.

### 1.2. Sơ đồ kiến trúc Microservices phân tán
Hệ thống được thiết kế theo mô hình kiến trúc đa lớp độc lập, bảo mật và phân tán:

```
[React Frontend - Port 3000] ─── (HTTP) ───► [API Gateway - Port 8900]
                                                     │ (Định tuyến / Cân bằng tải)
                                                     ├──► [User Service - Port 8811] ───► [User DB (MySQL)]
                                                     ├──► [Catalog Service - Port 8810] ──► [Catalog DB (MySQL)]
                                                     ├──► [Recommendation - Port 8812] ──► [Rec DB (MySQL)]
                                                     └──► [Order Service - Port 8813] ───► [Order DB (MySQL)] ──► [VNPay Gateway]
```

### 1.3. Tổng quan các dịch vụ thành phần và Công nghệ sử dụng
Hệ thống ứng dụng các công nghệ hiện đại ở cả hai phía Backend và Frontend:

* **Backend Framework:** Spring Boot (phiên bản `2.1.5.RELEASE`), Spring Cloud (môi trường đám mây phân tán).
* **Service Discovery:** Netflix Eureka Server nhằm quản lý, giám sát trạng thái và tự động phát hiện các instance dịch vụ.
* **API Gateway:** Netflix Zuul/Spring Cloud Gateway đóng vai trò là chốt chặn duy nhất, định tuyến các yêu cầu từ Client đến dịch vụ thích hợp và giải quyết vấn đề CORS.
* **Database Engine:** MySQL (chạy cục bộ trên nền tảng Laragon) nhằm lưu trữ dữ liệu bền vững. Cơ chế **Database per Service** đảm bảo tính độc lập dữ liệu cao nhất giữa các phân hệ.
* **Data Access Layer:** Spring Data JPA kết hợp Hibernate để tương tác hướng đối tượng với cơ sở dữ liệu một cách an toàn và nhanh chóng.
* **Frontend Application:** React.js (sử dụng thư viện hooks hiện đại, kết hợp với Vanilla CSS để tối ưu hóa hiệu năng render giao diện, tạo hiệu ứng mượt mà, responsive đa thiết bị).

---

# PHẦN II: TIẾN ĐỘ THỰC HIỆN CHI TIẾT TRONG 3 TUẦN

## 2.1. TUẦN 1: Khởi tạo hạ tầng, Eureka Server, API Gateway, Phân hệ Xác thực Người dùng & Giao diện Cơ bản

Tuần đầu tiên tập trung hoàn toàn vào việc xây dựng nền móng kiến trúc hệ thống phân tán, chuẩn bị môi trường chạy, thiết lập các service lõi của hệ thống Spring Cloud và hoàn thiện tính năng Đăng nhập - Đăng ký.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              TUẦN 1                                    │
├───────────────────┬────────────────────────────────────────────────────┤
│ Thứ Hai - Thứ Ba  │ Cài đặt môi trường, phân tích nghiệp vụ hệ thống  │
├───────────────────┼────────────────────────────────────────────────────┤
│ Thứ Tư            │ Triển khai Eureka Server & API Gateway             │
├───────────────────┼────────────────────────────────────────────────────┤
│ Thứ Năm - Thứ Sáu │ Thiết kế User-service, MySQL DB & APIs xác thực    │
├───────────────────┼────────────────────────────────────────────────────┤
│ Thứ Bảy - Chủ Nhật│ Xây dựng giao diện React Login, Register & Banners │
└───────────────────┴────────────────────────────────────────────────────┘
```

### Chi tiết các công việc thực hiện theo ngày:

#### 1. Thứ Hai & Thứ Ba: Phân tích yêu cầu nghiệp vụ và Cài đặt môi trường phát triển
* **Phân tích nghiệp vụ:** Xác định các thực thể và yêu cầu của người dùng, phân tách các nghiệp vụ lõi thành các Microservices độc lập (User, Product Catalog, Order, Recommendation).
* **Cài đặt môi trường:** Cài đặt JDK 11 (phiên bản ổn định dài hạn LTS), cấu hình biến môi trường `JAVA_HOME`. Cài đặt và cấu hình máy chủ cơ sở dữ liệu MySQL thông qua Laragon. Cài đặt Node.js để chạy môi trường React.
* **Cấu hình Maven Parent:** Khởi tạo thư mục gốc cho dự án, cấu hình file `pom.xml` cha để quản lý phân bản của Spring Boot và Spring Cloud, giảm thiểu xung đột thư viện giữa các service con.

#### 2. Thứ Tư: Triển khai Service Discovery (Eureka Server) & API Gateway
* **Xây dựng Eureka Discovery Server (`eureka-server`):**
  * Tạo project Spring Boot mới, tích hợp thư viện `spring-cloud-starter-netflix-eureka-server`.
  * Cấu hình file application.properties để kích hoạt chế độ Server (tắt tự đăng ký với chính nó):
    ```properties
    server.port=8761
    eureka.client.register-with-eureka=false
    eureka.client.fetch-registry=false
    ```
  * Thêm annotation `@EnableEurekaServer` trong class khởi chạy chính.
* **Xây dựng API Gateway (`api-gateway`):**
  * Thiết lập cổng duy nhất đón nhận yêu cầu (Port `8900`). Tích hợp thư viện Ribbon để cân bằng tải (Load Balancing) giữa các service nội bộ.
  * Cấu hình định tuyến (Routing) linh hoạt. Các API từ frontend có đường dẫn `/api/users/**` sẽ được tự động định tuyến đến `user-service`, `/api/catalog/**` đến `product-catalog-service`, v.v.

#### 3. Thứ Năm & Thứ Sáu: Thiết kế Cơ sở dữ liệu và Phát triển Dịch vụ Người dùng (`user-service`)
* **Thiết lập database `user`:** Tạo cơ sở dữ liệu MySQL tên là `user` phục vụ riêng cho dịch vụ này.
* **Xây dựng Dịch vụ người dùng (`user-service`):**
  * Tích hợp cơ chế tự động tạo và cập nhật cấu trúc bảng thông qua Hibernate (`spring.jpa.hibernate.ddl-auto=update`).
  * Định nghĩa thực thể `User` với các trường thông tin: `id` (Khóa chính tự tăng), `username` (Tên đăng nhập duy nhất), `password` (Mật khẩu đã mã hóa), `email`, `role` (Phân quyền người dùng: USER hoặc ADMIN), `balance` (Số dư tài khoản), `loyaltyPoints` (Điểm tích lũy khách hàng).
  * Viết các API REST phục vụ đăng ký (`/api/users/register`), đăng nhập (`/api/users/login`), và quên mật khẩu (`/api/users/forgot-password`).
  * Thực hiện mã hóa mật khẩu để bảo vệ dữ liệu người dùng trước khi lưu vào MySQL.

#### 4. Thứ Bảy & Chủ Nhật: Thiết kế giao diện Frontend React cơ bản
* Khởi tạo dự án React JS trong thư mục `frontend`, cài đặt các thư viện cần thiết như `axios` để thực hiện call HTTP APIs, `react-router-dom` để phân trang điều hướng.
* **Thiết kế component NavBar & Header:** Giao diện thanh công cụ trực quan, tự động thay đổi hiển thị tùy thuộc vào việc người dùng đã đăng nhập hay chưa (hiển thị Avatar, nút Giỏ hàng kèm số lượng sản phẩm, nút Đăng xuất).
* **Thiết kế form Đăng ký & Đăng nhập (`Login.js`, `Register.js`):** Xây dựng các biểu mẫu tương tác đẹp mắt với hiệu ứng chuyển đổi mượt mà. Tích hợp kiểm tra dữ liệu đầu vào (Validation) như định dạng Email, độ dài mật khẩu.
* **Xây dựng tính năng Quên mật khẩu (`ForgotPassword.js`):** Cho phép người dùng lấy lại mật khẩu một cách nhanh chóng thông qua việc nhập Email xác nhận.

---

## 2.2. TUẦN 2: Phát triển Catalog Sản phẩm, Hệ thống Gợi ý (Recommendation), Giỏ hàng, Đánh giá (Reviews) & AI Chatbot

Tuần thứ hai hướng tới việc xây dựng các nghiệp vụ thương mại điện tử cốt lõi liên quan đến sản phẩm, giỏ hàng, và tăng cường tính năng tương tác thông qua trí tuệ nhân tạo (AI Chatbot) và các đánh giá trực quan của khách hàng.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              TUẦN 2                                    │
├───────────────────┬────────────────────────────────────────────────────┤
│ Thứ Hai - Thứ Ba  │ Triển khai Product-catalog-service & DB MySQL      │
├───────────────────┼────────────────────────────────────────────────────┤
│ Thứ Tư            │ Triển khai Product-recommendation-service & Giỏ hàng│
├───────────────────┼────────────────────────────────────────────────────┤
│ Thứ Năm           │ Phát triển tính năng Đánh giá sản phẩm (Reviews)   │
├───────────────────┼────────────────────────────────────────────────────┤
│ Thứ Sáu           │ Thiết lập Trợ lý ảo AI Chatbot (ChatWidget)        │
├───────────────────┼────────────────────────────────────────────────────┤
│ Thứ Bảy - Chủ Nhật│ Viết PowerShell seed 30 sản phẩm & bố cục landing  │
└───────────────────┴────────────────────────────────────────────────────┘
```

### Chi tiết các công việc thực hiện theo ngày:

#### 1. Thứ Hai & Thứ Ba: Triển khai Dịch vụ Danh mục Sản phẩm (`product-catalog-service`)
* **Thiết lập database `product-catalog-service`:** Tạo database chuyên biệt trên MySQL.
* **Xây dựng thực thể và API cho sản phẩm (`product-catalog-service`):**
  * Khởi tạo thực thể `Product` với các thuộc tính: `id`, `productName`, `price`, `discription` (mô tả sản phẩm), `category` (danh mục), `availability` (số lượng tồn kho thực tế), `imageUrl`, `imageUrl2` (hình ảnh phụ bổ trợ), `discountPercent` (tỷ lệ giảm giá), và `section` (nhãn định dạng vị trí hiển thị như *Exclusive*, *Best Selling*, *New Arrivals*, hoặc *Normal*).
  * Viết các APIs phục vụ việc xem danh sách sản phẩm, chi tiết sản phẩm (`/api/catalog/products/{id}`), và các APIs quản trị Admin (`POST /api/catalog/admin/products`, `PUT /api/catalog/products/{id}`, `DELETE /api/catalog/admin/products/{id}`) để thêm, sửa, xóa sản phẩm.
* **Thiết kế Frontend Trang chi tiết sản phẩm (`ProductDetail.js`):**
  * Xây dựng giao diện zoom hình ảnh sản phẩm chất lượng cao, hiển thị rõ ràng thông tin giá gốc và giá sau khi đã giảm giá.
  * Hiển thị trạng thái tồn kho thời gian thực (được đồng bộ trực tiếp từ backend).

#### 2. Thứ Tư: Xây dựng Dịch vụ Gợi ý Sản phẩm (`product-recommendation-service`) & Phân hệ Giỏ hàng
* **Xây dựng Dịch vụ Gợi ý (`product-recommendation-service`):**
  * Thiết lập một service độc lập trên port `8812` kết nối với cơ sở dữ liệu `product-recommendation`.
  * Định nghĩa thuật toán gợi ý cơ bản: Trả về danh sách các sản phẩm có cùng danh mục (category) hoặc các sản phẩm có cùng mức phân khúc giá nhằm kích thích hành vi mua sắm chéo của khách hàng.
  * Viết API endpoint `/api/recommendations/product/{productId}` để trả về danh sách gợi ý cho trang chi tiết sản phẩm.
* **Hoàn thiện Phân hệ Giỏ hàng (`Cart.js`):**
  * Xây dựng giao diện giỏ hàng trực quan, hỗ trợ khách hàng tăng giảm số lượng sản phẩm, hiển thị tổng tiền tạm tính trực quan.
  * Tích hợp lưu trữ giỏ hàng trong LocalStorage đối với khách vãng lai, và đồng bộ tự động lên backend khi khách hàng thực hiện đăng nhập hệ thống.

#### 3. Thứ Năm: Thiết kế hệ thống Đánh giá Sản phẩm (Reviews)
* **Xây dựng thực thể Đánh giá (`Review`):**
  * Thiết lập mối quan hệ thực thể giữa `User` và `Product` để lưu trữ thông tin đánh giá. Một đánh giá bao gồm: `id`, `productId`, `username` (người đánh giá), `rating` (số sao đánh giá từ 1 đến 5), `comment` (bình luận chi tiết), và `createdAt` (thời điểm đánh giá).
* **Thiết kế UI cho Review Section (`ReviewSection.js` & `ReviewPage.js`):**
  * Tạo giao diện chấm điểm bằng số sao động (Interactive Star Rating), hiển thị trung bình cộng số sao của sản phẩm và danh sách các phản hồi chi tiết từ những khách hàng khác ở ngay phía dưới trang chi tiết sản phẩm.

#### 4. Thứ Sáu: Tích hợp Trợ lý ảo AI Chatbot tư vấn mua sắm (`ChatWidget`)
* Xây dựng component chat nổi thông minh ở góc màn hình (`ChatWidget.js` & `ChatWidget.css`).
* Tích hợp luồng trò chuyện tự động: Khi người dùng mở hộp thoại chat, trợ lý ảo sẽ chủ động gửi lời chào thân thiện.
* Kết nối chatbot với cơ sở dữ liệu sản phẩm để cung cấp các gợi ý mua sắm thông minh (ví dụ: tư vấn chọn quà, trả lời nhanh các câu hỏi thường gặp về chính sách giao hàng, thanh toán, hoặc tư vấn chi tiết về cấu hình của các mô hình, tượng đồ chơi theo sở thích của người dùng).
* Giao diện chat được thiết kế bo góc thời thượng, phối màu Gradient mượt mà tạo cảm giác cực kỳ chuyên nghiệp và cao cấp.

#### 5. Thứ Bảy & Chủ Nhật: Tự động hóa Seed dữ liệu lớn và Định dạng Trang chủ
* **Tự động hóa Seed dữ liệu:** Viết các script PowerShell mạnh mẽ để khởi tạo dữ liệu một cách chuyên nghiệp:
  * `add_30_products.ps1`: Tự động gọi API Gateway gửi dữ liệu JSON để nạp vào database catalog 30 sản phẩm đồ chơi và tượng sưu tầm cao cấp với đầy đủ hình ảnh, mô tả chi tiết, số lượng tồn kho và các mức giá thực tế.
  * `update_sections.ps1`: Tự động duyệt qua toàn bộ sản phẩm và phân phối chúng vào các danh mục trang chủ (`Exclusive`, `Best Selling`, `New Arrivals`).
* **Hoàn thiện Trang chủ (`Home.js`):** 
  * Thiết kế các Slider Banner trượt mượt mà giới thiệu các sự kiện khuyến mãi lớn.
  * Phân chia trang chủ thành các Section riêng biệt tương ứng với thiết lập dữ liệu (Sản phẩm độc quyền, Sản phẩm bán chạy, Hàng mới về), giúp người dùng dễ dàng khám phá và mua sắm.

---

## 2.3. TUẦN 3: Tích hợp Cổng thanh toán VNPay, Đơn hàng, Hệ thống Điểm thưởng Khách hàng thân thiết (Loyalty Points), Vòng quay may mắn (Lucky Wheel) & Kiểm thử Tích hợp

Tuần cuối cùng là giai đoạn quan trọng nhất, tập trung vào việc hiện thực hóa các chức năng thanh toán trực tuyến, quản lý vòng đời đơn hàng, tăng độ tương tác và giữ chân khách hàng qua điểm thưởng cùng mini-game, cuối cùng là kiểm thử và chạy thực tế dự án.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              TUẦN 3                                    │
├───────────────────┬────────────────────────────────────────────────────┤
│ Thứ Hai - Thứ Ba  │ Triển khai Order-service & Cơ sở dữ liệu Orders     │
├───────────────────┼────────────────────────────────────────────────────┤
│ Thứ Tư            │ Tích hợp Cổng thanh toán trực tuyến VNPay Sandbox │
├───────────────────┼────────────────────────────────────────────────────┤
│ Thứ Sáu           │ Xây dựng Loyalty Points Wallet & Lucky Wheel game  │
├───────────────────┼────────────────────────────────────────────────────┤
│ Thứ Bảy           │ Kiểm thử tích hợp toàn diện và tối ưu hóa hệ thống │
├───────────────────┼────────────────────────────────────────────────────┤
│ Chủ Nhật          │ Khởi chạy thực tế toàn bộ hệ thống bằng PowerShell │
└───────────────────┴────────────────────────────────────────────────────┘
```

### Chi tiết các công việc thực hiện theo ngày:

#### 1. Thứ Hai & Thứ Ba: Triển khai Dịch vụ Đơn hàng (`order-service`)
* **Thiết lập database `orders`:** Tạo database chuyên biệt trên MySQL để lưu trữ thông tin giao dịch.
* **Xây dựng dịch vụ quản lý Đơn hàng (`order-service`):**
  * Định nghĩa hai thực thể cốt lõi: `Order` (chứa thông tin tổng quan của đơn hàng như khách mua, tổng tiền, phương thức thanh toán, trạng thái giao dịch) và `OrderItem` (lưu trữ chi tiết các sản phẩm trong đơn hàng gồm mã sản phẩm, đơn giá, số lượng mua).
  * Xây dựng máy trạng thái đơn hàng (Order State Machine) để quản lý nghiêm ngặt vòng đời của một đơn hàng qua các bước: `PENDING` (Chờ xử lý) -> `CONFIRMED` (Đã xác nhận) -> `COMPLETED` (Đã hoàn thành) hoặc `CANCELLED` (Đã hủy đơn).
  * Viết các APIs cho phép khách hàng tạo đơn hàng (`POST /api/orders`), lấy lịch sử đơn hàng cá nhân (`GET /api/orders/user/{username}`), hủy đơn hàng (`PUT /api/orders/{id}/cancel`), và API dành riêng cho quản trị viên để cập nhật trạng thái giao hàng.
* **Thiết kế trang lịch sử mua hàng (`UserOrders.js`):** Khách hàng có thể theo dõi danh sách tất cả các đơn hàng mình đã đặt, trạng thái hiện tại của từng đơn hàng, và thực hiện hủy đơn hàng trực tiếp ngay trên giao diện nếu đơn hàng đó chưa được vận chuyển.

#### 2. Thứ Tư & Thứ Năm: Tích hợp cổng thanh toán trực tuyến VNPay Sandbox
* **Hiện thực hóa VNPayService trên Backend:**
  * Sử dụng môi trường thử nghiệm **VNPay Sandbox** dành cho nhà phát triển.
  * Viết lớp nghiệp vụ xử lý mã hóa bảo mật VNPayService.java:
    * Thiết lập cấu hình các thông số bảo mật quan trọng: Mã website (TMN Code), khóa bảo mật (Hash Secret) để tạo chữ ký điện tử.
    * Xây dựng giải thuật băm một chiều an toàn cao **HmacSHA512** để tính toán chữ ký kiểm tra tính toàn vẹn của dữ liệu truyền đi (Secure Hash).
    * Thiết lập chuỗi tham số gửi lên VNPay (bao gồm số tiền giao dịch, mã đơn hàng, địa chỉ IP của khách hàng, thời điểm tạo lệnh thanh toán).
  * Tạo API `/api/orders/create-vnpay-payment` để tạo liên kết chuyển hướng thanh toán (Redirect URL) an toàn đến cổng thanh toán VNPay.
* **Xử lý phản hồi thanh toán (Return URL & IPN):**
  * Xây dựng giao diện phản hồi thanh toán trên React (`PaymentSuccess.js`): Nhận các tham số VNPay trả về qua URL sau khi khách hàng thực hiện thanh toán trên cổng VNPay (như mã phản hồi `vnp_ResponseCode`, số tiền, mã giao dịch của VNPay).
  * Nếu thanh toán thành công (`vnp_ResponseCode = 00`): Gửi yêu cầu cập nhật trạng thái đơn hàng từ `PENDING` thành `CONFIRMED`, đánh dấu đơn hàng là đã thanh toán trực tuyến, đồng thời gọi API cộng điểm tích lũy thành viên tương ứng với giá trị đơn hàng.
  * Thiết kế trang hiển thị kết quả thanh toán thành công/thất bại vô cùng sinh động với các hiệu ứng động, nút quay lại trang chủ và xem hóa đơn chi tiết.

#### 3. Thứ Sáu: Phát triển Ví điểm thưởng (Loyalty Points) & Game Vòng quay may mắn (Lucky Wheel)
* **Xây dựng Ví điểm thưởng tích lũy (Loyalty Points):**
  * Quy đổi điểm thưởng tự động: Mỗi đơn hàng hoàn tất sẽ cộng điểm tích lũy vào tài khoản người dùng theo tỷ lệ 1% giá trị đơn hàng (Ví dụ: Đơn hàng trị giá $100 sẽ được cộng 1 điểm Loyalty).
  * Thiết kế giao diện Ví điểm thưởng (`LoyaltyPoints.js`):
    * Hiển thị bảng xếp hạng thành viên động dựa trên tổng số điểm tích lũy của khách hàng: **Silver** (< 100 điểm), **Gold** (100 - 500 điểm), **Platinum** (> 500 điểm). Từng cấp bậc thành viên sẽ nhận được tỷ lệ ưu đãi giảm giá mặc định khác nhau khi thanh toán đơn hàng.
    * Cho phép đổi điểm thưởng lấy mã giảm giá (Vouchers): Quy đổi trực tiếp điểm tích lũy sang các voucher giảm giá (Ví dụ: 10 điểm = Voucher giảm giá $5, 20 điểm = Voucher giảm giá $12). Các voucher này sẽ được lưu trực tiếp vào ví voucher của người dùng và áp dụng ngay ở bước thanh toán đơn hàng tiếp theo.
* **Tích hợp game tương tác Vòng quay may mắn (Lucky Wheel):**
  * Để tạo trải nghiệm thú vị, giữ chân khách hàng, tôi đã thiết kế thêm một trò chơi mini-game Vòng quay may mắn (`LuckyWheel.js`).
  * Người dùng có thể tiêu hao một lượng điểm nhỏ (ví dụ: 2 điểm) cho mỗi lượt quay để có cơ hội trúng các giải thưởng điểm thưởng lớn hơn (Ví dụ: trúng 5 điểm, 10 điểm, hoặc các voucher giảm giá đặc biệt).
  * Hiệu ứng vòng quay xoay tròn vật lý mượt mà bằng CSS kết hợp âm thanh vui nhộn mang lại trải nghiệm vô cùng chân thực và thú vị cho khách hàng.

#### 4. Thứ Bảy: Kiểm thử tích hợp hệ thống toàn diện (Integration Testing)
* **Kiểm thử liên dịch vụ (Inter-service Communication):** Thực hiện đặt hàng và kiểm tra xem `order-service` có giao tiếp chuẩn xác với `product-catalog-service` để trừ số lượng tồn kho sản phẩm tương ứng hay không.
* **Kiểm thử luồng thanh toán VNPay:** Đóng vai trò là khách hàng thực hiện chọn sản phẩm vào giỏ, nhập địa chỉ nhận hàng, chọn phương thức VNPay, chuyển hướng cổng thanh toán, nhập thẻ test ngân hàng nội địa của VNPay, nhận kết quả và quay lại trang web bán hàng để kiểm tra tính chính xác của dữ liệu cập nhật trạng thái đơn hàng.
* **Kiểm thử bảo mật dữ liệu:** Kiểm thử tính đúng đắn khi thực hiện đổi điểm, trừ điểm tích lũy và cập nhật ví voucher, đảm bảo không thể xảy ra hiện tượng mất dữ liệu hay sai lệch số dư.

#### 5. Thứ Bảy & Chủ Nhật: Triển khai Khởi chạy Thực tế
* Phát triển script tự động khởi chạy tổng thể dự án start_all.ps1. Script này giúp giải phóng hoàn toàn sức lao động khi triển khai ứng dụng bằng cách:
  * Khởi động Eureka Server trước, cho phép thời gian ngủ 15 giây để máy chủ định danh ổn định.
  * Tự động khởi chạy lần lượt 5 Microservices cốt lõi ở các cổng mạng riêng biệt trong các tiến trình PowerShell nền song song.
  * Khởi động React Web Server cho Frontend.
* Tất cả dịch vụ được đồng bộ hóa thành công, hiển thị trực quan trạng thái khỏe mạnh trên Eureka Dashboard (`http://localhost:8761`) và chạy mượt mà trên trình duyệt của người dùng (`http://localhost:3000`).

---

# PHẦN III: THIẾT KẾ CƠ SỞ DỮ LIỆU & CẤU HÌNH HỆ THỐNG

### 3.1. Các Cơ sở dữ liệu độc lập (Database per Service)
Dự án tuân thủ nghiêm ngặt nguyên lý thiết kế Microservices bằng cách tách biệt hoàn toàn cơ sở dữ liệu cho từng dịch vụ để tránh sự phụ thuộc chéo về mặt dữ liệu:

1. **`user` Database:** Lưu giữ thông tin bảo mật của người dùng, phân quyền, số dư tài khoản và ví điểm thưởng.
2. **`product-catalog-service` Database:** Lưu giữ kho thông tin sản phẩm, mô tả, danh mục hiển thị, tồn kho và các đường dẫn hình ảnh.
3. **`product-recommendation` Database:** Lưu giữ liên kết gợi ý thông minh của các nhóm sản phẩm có mối liên hệ mua sắm cùng nhau.
4. **`orders` Database:** Lưu trữ chi tiết đơn hàng, dòng sản phẩm đã mua, địa chỉ giao hàng và mã thanh toán quốc tế VNPay.

### 3.2. Sơ đồ các bảng dữ liệu chính

#### 1. Bảng `users` (Database: `user`)
Lưu giữ thông tin tài khoản người dùng và xếp hạng thành viên:
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Mã định danh người dùng duy nhất |
| `username` | VARCHAR(255) | UNIQUE, NOT NULL | Tên tài khoản đăng nhập |
| `password` | VARCHAR(255) | NOT NULL | Mật khẩu tài khoản (đã mã hóa bảo mật) |
| `email` | VARCHAR(255) | NOT NULL | Thư điện tử |
| `role` | VARCHAR(50) | DEFAULT 'USER' | Quyền truy cập (`USER` hoặc `ADMIN`) |
| `balance` | DOUBLE | DEFAULT 0.0 | Số dư khả dụng của ví điện tử cá nhân |
| `loyalty_points` | INT | DEFAULT 0 | Điểm tích lũy thăng hạng khách hàng |

#### 2. Bảng `products` (Database: `product-catalog-service`)
Chứa toàn bộ thông tin chi tiết của các sản phẩm trưng bày trên trang web:
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Mã số sản phẩm |
| `product_name` | VARCHAR(255) | NOT NULL | Tên đầy đủ của sản phẩm |
| `price` | DOUBLE | NOT NULL | Giá gốc niêm yết của sản phẩm |
| `discription` | TEXT | | Bài viết/đoạn văn mô tả chi tiết sản phẩm |
| `category` | VARCHAR(255) | NOT NULL | Danh mục phân loại sản phẩm |
| `availability` | INT | NOT NULL | Số lượng tồn kho thực tế của sản phẩm |
| `image_url` | LONGTEXT | | Đường dẫn URL hình ảnh chính đại diện |
| `image_url_2` | LONGTEXT | | Đường dẫn URL hình ảnh phụ góc cạnh |
| `discount_percent`| INT | DEFAULT 0 | Tỷ lệ giảm giá sản phẩm (%) |
| `section` | VARCHAR(100) | DEFAULT 'Normal' | Khu vực trưng bày (Exclusive, Best Selling, v.v.) |

#### 3. Bảng `orders` (Database: `orders`)
Lưu trữ thông tin giao dịch tổng thể của hóa đơn mua hàng:
| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Mã hóa đơn duy nhất của hệ thống |
| `username` | VARCHAR(255) | NOT NULL | Tài khoản của người mua hàng |
| `total_price` | DOUBLE | NOT NULL | Tổng số tiền phải thanh toán của đơn hàng |
| `shipping_address`| VARCHAR(500) | NOT NULL | Địa chỉ chi tiết nhận hàng |
| `payment_method` | VARCHAR(100) | NOT NULL | Phương thức (VNPay, COD) |
| `status` | VARCHAR(50) | DEFAULT 'PENDING' | Trạng thái (PENDING, CONFIRMED, COMPLETED, CANCELLED) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày giờ thiết lập đơn hàng |

---

# PHẦN IV: ĐÁNH GIÁ KẾT QUẢ ĐẠT ĐƯỢC & HƯỚNG PHÁT TRIỂN

### 4.1. Đánh giá Ưu và Nhược điểm của hệ thống

#### Ưu điểm:
1. **Khả năng hoạt động độc lập cực tốt:** Nhờ kiến trúc Microservices phân tán, mỗi dịch vụ hoạt động tách biệt. Khi dịch vụ gợi ý (`product-recommendation-service`) gặp sự cố, hệ thống bán hàng cốt lõi và thanh toán vẫn hoạt động bình thường mà không hề bị gián đoạn.
2. **Quy trình thanh toán thông suốt và an toàn:** Việc tích hợp thành công **VNPay Sandbox** mang đến trải nghiệm thanh toán trực tuyến chính xác, bảo mật cao nhờ giải thuật ký số HmacSHA512.
3. **Trải nghiệm người dùng phong phú (Premium UX):** Việc bổ sung các tính năng nâng cao như **Loyalty Points Wallet**, mini-game **Vòng quay may mắn (Lucky Wheel)**, **AI Chatbot** hỗ trợ trực tuyến và hệ thống phân chia các phần sản phẩm đặc sắc giúp trang web thương mại trở nên cực kỳ sinh động, cuốn hút và chuyên nghiệp hơn rất nhiều so với các website bán hàng thông thường.
4. **Quản trị dễ dàng:** Trang quản trị Admin được tích hợp đầy đủ các công cụ trực quan để quản lý sản phẩm, đơn hàng, xếp hạng thành viên, giúp người quản lý dễ dàng kiểm soát toàn bộ hoạt động kinh doanh.

#### Nhược điểm cần khắc phục:
1. **Thời gian khởi động ban đầu dài:** Do hệ thống chứa tới 6 dịch vụ Spring Boot và một ứng dụng React chạy đồng thời nên khi khởi động lần đầu trên một máy chủ cục bộ sẽ xảy ra hiện tượng tranh chấp tài nguyên hệ thống (RAM, CPU), mất từ 60-90 giây để toàn bộ hệ thống đi vào hoạt động trơn tru.
2. **Quản lý cấu hình tập trung:** Hệ thống hiện đang cấu hình các thông số kết nối cơ sở dữ liệu riêng rẽ trong từng file `application.properties` của mỗi service con. Trong thực tế khi triển khai quy mô lớn, việc này sẽ gây khó khăn cho việc đồng bộ và bảo mật.

### 4.2. Hướng phát triển tiếp theo
Để hệ thống thương mại điện tử đạt được quy mô công nghiệp và sẵn sàng đưa vào vận hành thực tế thương mại, định hướng phát triển tiếp theo bao gồm:
1. **Tích hợp Spring Cloud Config Server:** Tập trung hóa toàn bộ cấu hình hệ thống tại một kho lưu trữ bảo mật duy nhất, cho phép cập nhật cấu hình nóng (Hot Reload) không cần khởi động lại dịch vụ.
2. **Triển khai Công nghệ Container hóa (Docker & Kubernetes):** Đóng gói mỗi Microservice thành các Docker Image độc lập, sử dụng Kubernetes để tự động hóa việc triển khai, mở rộng số lượng bản sao dịch vụ (Auto Scaling) dựa trên tải thực tế của thị trường.
3. **Nâng cấp thuật toán AI của Chatbot và Gợi ý:** Tích hợp các mô hình học máy (Machine Learning) tiên tiến để phân tích sâu sắc hơn hành vi mua sắm của khách hàng, đưa ra các gợi ý sản phẩm mang tính cá nhân hóa cực cao, tối ưu hóa tỷ lệ chuyển đổi đơn hàng.
4. **Bảo mật phân tán với JWT & OAuth2:** Áp dụng cơ chế xác thực tập trung thông qua một Authorization Server, sử dụng mã thông báo JSON Web Token (JWT) để bảo mật tuyệt đối các đường dẫn APIs kết nối giữa Frontend và Backend.

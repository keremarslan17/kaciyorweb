# Proje: Kaçıyor React Uygulaması

## Genel Hedef
Kullanıcıların konum tabanlı olarak yakındaki restorant ve kafeleri görmesini, uygulama sayesinde hangi işletmede ne kadar indirimi olduğunu, ve işletmelere gitmeden indirimli menülerini görmesini sağlayan bir  sağlayan bir mobil uygulama. kaciyor.com adında bir websitesi de var bu web app de aynı işlevleri kullanıyor ve bu ikisi tamamen aynı server ve backendi kullanmalı, birinde yapılan değişiklik diğerinde de anında gözükmeli. Bu uygulama hep IOS hem Android de yayınlanacak. Web versyonu da react kullanılarak kodlanacak.

## Özellikler (Features)

### 1. Kullanıcı Kimlik Doğrulama (Authentication)
- [x] E-posta ve şifre ile kayıt olma ekranı.
- [x] Giriş yapma ekranı.
- [x] Oturumu kapatma işlevselliği.
- [ ] Şifremi unuttum akışı.
- [ ] Google ile giriş yapma seçeneği.
- [ ] Telefonla doğrulama.

**Profilim sekmesi:** Bilgilerin güncellenmesi.

### 2. Harita Görünümü (Anasayfa)
- [x] Google Haritalar entegrasyonu ile restoranları gösterme.
- [x] Flaş İndirimler bölümü, en yakın restorandan başlayarak sıralanıyor.
- [x] Flaş İndirimler, Öne Çıkan Restoranlar ve İşletmelere yönelik reklam alanları eklendi.
- [x] Kullanıcının mevcut konumunu haritada gösterme.
- [ ] Bir iğneye tıklandığında detay kartı gösterme.

### 3. İşletme Menü Sayfası
- [x] İşletmenin menüsü veritabanından dinamik olarak yükleniyor.
- [x] Menüden ürünleri sepete ekleme, sepetten çıkarma ve sepeti düzenleme.
- [x] Sepeti onayla butonu ile sipariş oluşturma.
- [x] Sepet artık sadece tek bir restorana özel çalışıyor.
- [ ] Masa numarası girme.
- [ ] Sipariş onayı sonrası QR kod oluşturma.

### 4. İşletmeci Kontrol Paneli
- [ ] Menü ve indirim yönetimi.
- [ ] Garson tanımlama.

### 5. Garson Paneli
- [ ] Aktif siparişleri görme.
- [ ] QR kod ile sipariş onayı.

### 6. Kazanç Modeli
- [ ] Siparişlerden komisyon hesaplama.
- [ ] İşletmeler için reklam modeli.

### 7. Admin Paneli
- [ ] Restoran ve kullanıcı yönetimi.

---

## Proje Detayları ve Mevcut Durum

### Teknolojiler
*   **Frontend:** React (Vite ile oluşturuldu)
*   **Backend & Altopayı:** Firebase
*   **Versiyon Kontrolü:** Git & GitHub

### Tamamlanan Adımlar
*   **[Yapıldı]** Proje, `kaciyorortak` Firebase projesine bağlandı.
*   **[Yapıldı]** Tüm Firebase servisleri için temel yapılandırma dosyaları oluşturuldu.
*   **[Yapıldı]** Proje canlıya alındı.
*   **[Yapıldı]** Proje, bir GitHub deposuna bağlandı.
*   **[Yapıldı]** Build sistemi ve proje bağımlılıkları düzeltildi.
*   **[Yapıldı]** Temel kullanıcı kimlik doğrulama (Giriş, Kayıt, Çıkış) özellikleri eklendi.
*   **[Yapıldı]** Tamamen işlevsel, restorana özel dinamik sepet sistemi.
*   **[Yapıldı]** Google Haritalar entegrasyonu ve dinamik Ana Sayfa tasarımı.
*   **[Yapıldı]** Kullanıcı konumu isteme ve haritada gösterme özelliği eklendi.
*   **[Yapıldı]** Konum izni sonrası oluşan beyaz ekran hatası düzeltildi.
*   **[Yapıldı]** Flaş indirimler mesafeye göre sıralanıyor.

---

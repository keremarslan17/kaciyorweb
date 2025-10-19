## Proje: "Kaçıyor" - Restoran İndirim ve Sipariş Platformu

Bu döküman, "Kaçıyor" adlı mobil uygulamanın geliştirme sürecini, özelliklerini ve gelecek planlarını özetlemektedir.

## Amaç

Kullanıcıların anlık olarak yakındaki restoran indirimlerini görmesini, menüleri incelemesini ve sipariş vermesini sağlayan bir platform oluşturmak. İşletmeler için ise anlık indirimler yayınlayarak müşteri çekebilecekleri ve sipariş süreçlerini dijitalleştirebilecekleri bir araç sunmak.

## Özellikler (Features)

### 1. Kullanıcı Kimlik Doğrulama (Authentication)
- [x] E-posta ve şifre ile kayıt olma ekranı.
- [x] Farklı roller için (Müşteri, Personel) ayrı giriş ekranı.
- [x] Oturumu kapatma işlevselliği.
- [x] **Kayıt Olurken Onay:** Kullanıcı Sözleşmesi ve İletişim İzni onay kutuları eklendi. Onaylanmadan kayıt olunamaz.
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
- [x] **Masa Numarası:** Müşteri, siparişi onaylarken masa numarasını girer.
- [x] **Sipariş Onayı (QR Kod):** Müşteri siparişi oluşturunca, garsonun okutması için bir QR kod üretilir.

### 4. İşletmeci Kontrol Paneli
- [x] İşletmeciler için özel giriş ekranı.
- [x] İşletmeciye özel kontrol paneli arüyüzü.
- [x] Güvenli bir şekilde yeni garson ekleme (Cloud Function ile).
- [x] Mevcut garsonları listeleme.
- [x] **Şifre Sıfırlama:** İşletme sahibi, garsonları için şifre sıfırlama e-postası gönderebilir.
- [x] **İndirim Yönetimi:** Seçili ürünlere veya tüm ürünlere yüzde veya tutar olarak indirim uygulama.
- [x] **Satış Raporları:** Günlük, haftalık ve aylık satışları, adetleri ve ciroları detaylı olarak görme.
- [x] **Restoran Bilgileri:** Restoran ile ilgili tüm bilgileri düzenleyebilme.
- [x] **Menü Yönetimi:**
    - [x] Menüye ürün ekleme, silme ve düzenleme.
    - [x] Ürünleri kategorilere ayırma (Akordiyon menü).
    - [x] Kategorileri yönetme (ekleme, silme, düzenleme).
    - [x] Ürünlere fotoğraf ekleme (Firebase Storage entegrasyonu).
    - [x] Ürünlere alerjen bilgisi ekleme.
- [ ] **Sadakat Programı:** İşletmeci, sipariş tutarının yüzde kaçının müşteriye bakiye olarak döneceğini belirleyebilir.
- [ ] Garson silme.

### 5. Garson Paneli
- [x] Garsonlar için özel giriş ekranı.
- [x] Garson rolüne özel, sadeleştirilmiş arayüz (Navbar).
- [x] **Restoran Bilgisi:** Garson, panelde hangi restoranda çalıştığını görür.
- [x] Sipariş alma butonu içeren temel garson paneli sayfası.
- [x] **QR Kod ile Sipariş Onayı:** Garson, müşterinin QR kodunu okutarak sipariş detaylarını görür ve onaylar. Müşterinin ekranı anlık olarak güncellenir.
- [x] **Manuel Sipariş Alma:** Garson, QR kod olmadan sipariş detaylarını (masa no, ürünler) elle girebilir.
- [ ] Aktif siparişleri görme.

### 6. Sadakat Bakiyesi Sistemi
- [x] **Bakiye Kazanma:** Kullanıcılar, her siparişlerinden sonra, işletmecinin belirlediği oranda, o işletmede geçerli TL bakiyesi kazanır.
- [x] **Bakiye Görüntüleme:** Kullanıcılar, profil sayfalarında hangi restoranda ne kadar bakiyeleri olduğunu görebilir.
- [x] **Bakiye Kullanma:** Sipariş onay ekranında, kullanıcı mevcut bakiyesini görür ve tek tuşla fiyattan düşebilir.

### 7. Kazanç Modeli
- [ ] Siparişlerden komisyon hesaplama.
- [ ] İşletmeler için reklam modeli.

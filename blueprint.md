# Proje: Kaçıyor React Uygulaması

## Genel Hedef
Kullanıcıların konum tabanlı olarak yakındaki restorant ve kafeleri görmesini, uygulama sayesinde hangi işletmede ne kadar indirimi olduğunu, ve işletmelere gitmeden indirimli menülerini görmesini sağlayan bir mobil uygulama. kaciyor.com adında bir websitesi de var bu web app de aynı işlevleri kullanıyor ve bu ikisi tamamen aynı server ve backendi kullanmalı, birinde yapılan değişiklik diğerinde de anında gözükmeli. Bu uygulama hep IOS hem Android de yayınlanacak. Web versyonu da react kullanılarak kodlanacak.

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
- [ ] Masa numarası girme.
- [ ] Sipariş onayı sonrası QR kod oluşturma.

### 4. İşletmeci Kontrol Paneli
- [x] İşletmeciler için özel giriş ekranı.
- [x] İşletmeciye özel kontrol paneli arayüzü.
- [x] Güvenli bir şekilde yeni garson ekleme (Cloud Function ile).
- [x] Mevcut garsonları listeleme.
- [x] **İndirim Yönetimi:** Seçili ürünlere veya tüm ürünlere yüzde veya tutar olarak indirim uygulama.
- [x] **Satış Raporları:** Günlük, haftalık ve aylık satışları, adetleri ve ciroları detaylı olarak görme.
- [x] **Restoran Bilgileri:** Restoran ile ilgili tüm bilgileri düzenleyebilme.
- [ ] Menü ve indirim yönetimi.
- [ ] Garson silme.

### 5. Garson Paneli
- [x] Garsonlar için özel giriş ekranı.
- [x] Garson rolüne özel, sadeleştirilmiş arayüz (Navbar).
- [x] Sipariş alma butonu içeren temel garson paneli sayfası.
- [ ] Aktif siparişleri görme.
- [ ] QR kod ile sipariş onayı.

### 6. Kazanç Modeli
- [ ] Siparişlerden komisyon hesaplama.
- [ ] İşletmeler için reklam modeli.

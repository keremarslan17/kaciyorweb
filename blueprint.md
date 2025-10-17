# Proje: Kaçıyor React Uygulaması

## Genel Hedef
Kullanıcıların konum tabanlı olarak yakındaki restorant ve kafeleri görmesini, uygulama sayesinde hangi işletmede ne kadar indirimi olduğunu, ve işletmelere gitmeden indirimli menülerini görmesini sağlayan bir  sağlayan bir mobil uygulama. kaciyor.com adında bir websitesi de var bu web app de aynı işlevleri kullanıyor ve bu ikisi tamamen aynı server ve backendi kullanmalı, birinde yapılan değişiklik diğerinde de anında gözükmeli. Bu uygulama hep IOS hem Android de yayınlanacak. Web versyonu da react kullanılarak kodlanacak.

## Özellikler (Features)

### 1. Kullanıcı Kimlik Doğrulama (Authentication)
- [x] E-posta ve şifre ile kayıt olma ekranı.
- [x] Giriş yapma ekranı.
- [x] Oturumu kapatma işlevselliği.
- [ ] Şifremi unuttum akışı.
- [ ] Google ile giriş yapma seçeneği. Google ile giriş yaparken isim soyisim ve e posta verileri toplanır.
- [ ] Giriş yapılırken telefon numarası istenir ve doğrulama kodu gönderilir.

**Profilim sekmesi:** Buradan bilgiler güncellenebilir, isim soyisim, telefon numarası, e posta, okul, adres. Telefon numarası ve e posta guncellenirken tekrar doğrulama kodu gönderilir.

### 2. Harita Görünümü (Anasayfa)
- [ ] Kullanıcının mevcut konumunu gösteren bir harita.
- [ ] Harita üzerinde default olarak 10km çapında(ayarlanabilir) react native maps ile anlaşmalı olduğumuz kafe ve restoranları iğne (pin) ile gösterme.
- [ ] Bir iğneye tıklandığında restorantın menüsü için bir bağlantı ve adres indirim oranı gibi bilgileri gösteren bir kart.

### 3. İşletme Menü Sayfası
- [x] İşletmenin menüsü veritabanından dinamik olarak yükleniyor.
- [x] Menüden ürünleri sepete ekleme, sepetten çıkarma ve sepeti düzenleme.
- [x] Sepeti onayla butonu ile sipariş oluşturma.
- [ ] Masa numarası girme.
- [ ] Sepeti onayla butonuna basılınca sepet içerikleri kullanıcı bilgileri, masa numarası, zaman gibi damgalarla her seferinde benzersiz bir qr kod oluşturma.

### 4. İşletmeci Kontrol Paneli

-İşletmeci kullanıcı adı ve şifresiyle kendi restorantının kontrol paneline erişir. Bu panelde işletmesinin menüsünü düzenleyebilir fiyatları değiştirebilir istediği ürünlere indirim uygulayıp indirimleri kaldırabilir. Yeni ürünler ekleyip mevcut ürünleri çıkarabilir. Restoranına garson tanımlayabilir.

### 5. Garson Paneli

-Garsonlar aktif siparişleri görebilir, yeni sipariş al butonuyla yeni sipariş alabilir. Bir kişi sepeti onaylaya basınca garson paneline masa numarasını içeren bildirim gider. Garson kamerayı açarak qr kodu okutur, qr kod okutulunca ekranında sipariş detayları gözükür. Siparişi onaylaya basınca sipariş alınmış olur.

### 6. Kazanç modeli
-QR kod okutularak verilen indirimli sipariş tutarının %5 i kar olarak hesaplanır, anlık olarak güncellenir ve cari ödemeler sekmesinde işletcei kontrol panelinde gözükür. Ayrıca işletmeci kontrol panelinde reklam ver seceneği bulunur. Bu seceneğe basınca bir mailbox açılır ve info@kacior.com adresine mail göndermesi istenir.


### 7. Admin Paneli
Sadece belirli e posta ve şifreyle girilir. Yeni restoran ekleme ve resotran silme yetkilerine sahip olur. Tum panellere erişimi vardır. İşletmenin konumu dahil tüm bilgileri düzenler."

TIRNAK ICINE ALDIGIM KISIM KACIYOR REACT MOBIL UYGULAMASI. AYNI YAPIYI VERITABANINI VE BACKENDI KULLANAN BIR WEB APP INSA EDIYORUZ. MOBIL UYGULAMADA SEPETE EKLENEN WEBDE DE SEPETTE GOZUKSUN. BUTONLAR YAPILAR VE TASARIM TAMAMEN AYNI OLSUN. Yemeksepeti, getiryemek ve trendyolgo gibi dusun. kaciyorreact mobil kismiydi, bu proje kaciyorweb1 de web kismi. 




---

## 2. Proje Detayları ve Mevcut Durum

Bu bölümde projenin teknik altyapısı ve tamamlanan adımlar listelenmektedir.

### Teknolojiler
*   **Frontend:** React (Vite ile oluşturuldu)
*   **Backend & Altyapı:** Firebase
*   **Versiyon Kontrolü:** Git & GitHub

### Tamamlanan Adımlar
*   **[Yapıldı]** Proje, `kaciyorortak` Firebase projesine bağlandı.
*   **[Yapıldı]** Tüm Firebase servisleri için temel yapılandırma dosyaları (`firebase.json`, `.rules` dosyaları vb.) oluşturuldu.
*   **[Yapıldı]** Proje canlıya alındı ve `dist` klasöründen yayın yapıyor.
*   **[Yapıldı]** Proje, bir GitHub deposuna (`https://github.com/keremarslan17/kaciyorweb`) bağlandı.
*   **[Yapıldı]** Proje bağımlılıkları ve build sistemi hataları giderildi.
*   **[Yapıldı]** Temel kullanıcı kimlik doğrulama (Giriş, Kayıt) ve oturum yönetimi (Çıkış Yap) özellikleri eklendi.
*   **[Yapıldı]** Tamamen işlevsel, dinamik sepet sistemi (Ekleme, Çıkarma, Güncelleme, Sipariş Verme).

---


# ArtBooks

## Web-palvelinohjelmointi, harjoitustyö

Kalle Lehikoinen

[Linkki web-sovellukseen](https://ccc-gilt.vercel.app/)

[Frontend-lähdekoodi](https://github.com/klehik/artbooks_client)

## Taustaa

Tämä harjoitustyö on tehty mahdollista tulevaa oikeaa toimeksiantoa silmällä pitäen, jossa on tarkoitus luoda web-sovellus asiakkaalle. Sovellus toimii kuvakirja-arkistona, jossa kuvataiteilijat voivat esitellä teoksiaan. Sovelluksessa taiteilijat voivat tarjota teoksiaan(kuvakirjoja) sivustolle esiteltäviksi ja ylläpitäjän hyväksymät teokset julkaistaan sivustolla. Tämä harjoitustyö toimii palvelinpuolen ratkaisuna vielä ideatasolla olevalle toimeksiannolle.

## Ominaisuudet

- Käyttäjät voivat luoda artist-tilin ja kirjautuneet käyttäjät voivat tarjota teostaan julkaistavaksi.

- Ylläpitäjä(admin) voi esikatsella, julkaista, tai hylätä(poistaa) teoksen. Ylläpitäjä voi myös muokata teosta.

- Kirjautumattomat käyttäjät voivat selata julkaistuja teoksia

## Totetus

Palvelinpuoli on toteutettu Nodella ja Expressillä. Kuvat ladataan palvelimelle [Multer](https://www.npmjs.com/package/multer)-kirjastoa käyttäen ja tallennetaan palvelimen kautta [Firebase-storageen](https://firebase.google.com/docs/storage). Palvelimella luodaan autentikoitu yhteys Firebaseen kuvien tallentamista varten(Google service account). Client-puolella kuvat ladataan suoraan Firebasesta url-linkin avulla(read only). Käyttäjät ja teokset kuvalinkkeineen tallenetaan MongoDB-pilvipalveluun.

## Käyttäjänhallinta

Käyttäjänhallinta on toteutettu Passport-local strategialla ja express-session -kirjastolla. Sessiot tallenetaan MongoDB-tietokantaan.

Sovelluksessa on kaksi käyttäjäroolia, admin ja artist. Sivustolla rekistöröityneet käyttäjät voivat saada vain artist-roolin. Admin-roolia ei voi sovelluksen kautta rekisteröidä.

## Tietokanta

Tietokannassa on kaksi data-mallia, [Book](./models/Book.js) ja [User](./models/User.js). Book pitää sisällään teoksen perustietojen lisäksi teoksen ladanneen käyttäjän, kuvien url-osoiteet Firebaseen sekä tiedon siitä onko teos julkaistu vai ei. User-malli sisältää käyttäjän tietojen lisäksi kaikki artistin lataamat teokset.

Kuvat ladataan Firebaseen samassa formaatissa ja koossa, kuin käyttäjä on ne ladannut. Tiedoston tyyppi tarkastetaan palvelimella. Yhdestä kuvasta tehdään kevyempi kuva webp-formaatissa thumbnailia varten(Sharp-kirjasto).
<br>

## Reitit

> POST /auth/register

- Käyttäjän rekisteröinti

request

```json
{
  "username": "Testuser",
  "password": "1234",
  "email": "testuser@mail.com"
}
```

response

```json
{
  "message": "Testuser registered",
  "user": {
    "username": "Testuser",
    "email": "testuser@mail.com",
    "role": "artist",
    "books": [],
    "id": "64465dc7ed84ce6f2192a8e6"
  }
}
```

## <br>

---

> POST /auth/login

request

```json
{ "username": "Monet", "password": "1234" }
```

response

```json
{
  "message": "Monet logged in",
  "user": {
    "username": "Monet",
    "email": "monni@mail.com",
    "role": "artist",
    "books": ["643c16a4cd9df6c1c979b02e", "644656da8a1d4c0697a06272"],
    "id": "64341b5504a6ec8ff5886e39"
  }
}
```

## <br>

---

> POST /auth/logout

- Kirjaa ulos kirjautuneen käyttäjän

response

```json
{
  "message": "logged out"
}
```

## <br>

---

> GET /auth/user

- Palauttaa kirjautuneen käyttäjän

```json
{
  "id": "64341b5504a6ec8ff5886e39",
  "username": "Monet",
  "role": "artist"
}
```

## <br>

---

> POST /book

- Luo kirjan järjestelmään. Oletuksena kirjaa ei julkaista(published=false) ennen kuin admin on merkannut sen jullkaistavaksi. Req.body pitää sisällään kirjan perustiedot ja req.files kuvat. Vain kirjautunut käyttäjä voi lähettää pyynnön.

Esimerkki luodusta Book-objektista

```json
{
  "title": "The Woman in the Green Dress",
  "artist": "Claude Monet",
  "writer": "Claude Monet",
  "graphicDesigner": "Claude Monet",
  "description": "The painting in its whole depicts twelve people. They are clothed in Parisian fashion of the time. They are having a picnic near a forest glade. The people are gathered around a white picnic blanket, where food as fruits, cake or wine is located. The mood in this natural space is primarily created by the play of light and shadow, which originates by deciduous tree above them.",
  "images": [
    {
      "url": "https://storage.googleapis.com/download/storage/v1/b/photobooks-2d44b.appspot.com/o/images%2FTheWomanintheGreenDress%2F1682331353608--467px-Claude_Monet_-_Camille.jpeg?generation=1682331353996873&alt=media",
      "filename": "images/TheWomanintheGreenDress/1682331353608--467px-Claude_Monet_-_Camille.jpeg"
    },
    {
      "url": "https://storage.googleapis.com/download/storage/v1/b/photobooks-2d44b.appspot.com/o/images%2FTheWomanintheGreenDress%2F1682331353618--629px-Monet_dejeunersurlherbe.jpg?generation=1682331354007281&alt=media",
      "filename": "images/TheWomanintheGreenDress/1682331353618--629px-Monet_dejeunersurlherbe.jpg"
    },
    {
      "url": "https://storage.googleapis.com/download/storage/v1/b/photobooks-2d44b.appspot.com/o/images%2FTheWomanintheGreenDress%2F1682331354328--thumbnail?generation=1682331354575193&alt=media",
      "filename": "images/TheWomanintheGreenDress/1682331354328--thumbnail"
    }
  ],
  "published": false,
  "new": true,
  "user": "64341b5504a6ec8ff5886e39",
  "id": "644656da8a1d4c0697a06272"
}
```

## <br>

---

> GET /book?

- Adminilla on pääsy kaikkiin kirjoihin, muilla on pääsy vain julkaistuihin kirjoihin(published=true)

- Palauttaa kirjat halutuilla parametreillä

  | parametri | selite                                  |
  | --------- | --------------------------------------- |
  | page      | sivujen määrä                           |
  | limit     | kirjojen määrä /sivu                    |
  | search    | hakutermi nimen ja artistin perusteella |

- Esimerkiksi "book?page=2&limit=4&search=the" palauttaa 2\*4=8 ensimmäistä kirjaa, joissa hakutermi 'the' täyttyy.

- Page ja limit parametrit mahdollistavat selainpuolella pagination ja infinite scrolling toiminnot.

- Mongoosen skip-toiminnolla saisi myös palautettua tietyn sivun kirjat, mutta tämän projektin client-toteutuksen vuoksi palautetaan kaikki kirjat tiettyyn sivunumeroon asti.

- Tämä endpoint palauttaa myös sivujen kokonaismäärän joka lasketaan hakutulosten ja limitin perusteella.

```json
{
  "data": [
    {
      "title": "The Great Gatsby",
      "artist": "1",
      "writer": "1",
      "graphicDesigner": "1",
      "description": "1",
      "images": [
        {
          "url": "https://storage.googleapis.com/download/storage/v1/b/photobooks-2d44b.appspot.com/o/images%2F1%2F1681381730918--475px-Monet-woman-with-a-parasol-right.jpg?generation=1681381731286704&alt=media",
          "filename": "images/1/1681381730918--475px-Monet-woman-with-a-parasol-right.jpg"
        }
      ],
      "published": true,
      "new": false,
      "user": {
        "username": "Monet",
        "email": "monni@mail.com",
        "role": "artist",
        "books": ["643c16a4cd9df6c1c979b02e", "644656da8a1d4c0697a06272"],
        "id": "64341b5504a6ec8ff5886e39"
      }
    },

    {
      "title": "The Catcher in the Rye",
      "artist": "3",
      "writer": "3",
      "graphicDesigner": "3",
      "description": "3",
      "images": [],
      "published": true,
      "new": false,
      "user": {
        "username": "Monet",
        "email": "monni@mail.com",
        "role": "artist",
        "books": ["643c16a4cd9df6c1c979b02e", "644656da8a1d4c0697a06272"],
        "id": "64341b5504a6ec8ff5886e39"
      }
    }
  ],
  "pageCount": 3
}
```

## <br>

---

> GET /book/:id

- Palauttaa yksittäisen kirjan ID:n perusteella

## <br>

---

> GET /book/dashboard

- Palauttaa kirjat hallintapaneelia varten. Admin näkee kaikki kirjat. Kirjautunut käyttäjä näkee itse lataamansa kirjat. Kirjautumaton käyttäjä ei näe mitään

## <br>

---

> UPDATE/DELETE /book/:id

- Mahdollistaa adminille kirjan kenttien päivittämisen sekä julkaisemisen ja poistamisen.

## <br>

---

> GET /artists

- Palauttaa listan artisteista ja heidän kirjoistaan

## <br>

---

## Jatkokehitys

- Kirjojen sorttaus eri parametreillä

- Unohtuneen salasanan palautus

- Kuvien formaatin yhtenäistäminen ja koon rajoittaminen/kompressointi tilan säästämiseksi.

- Käyttäjienhallinta

- Testit

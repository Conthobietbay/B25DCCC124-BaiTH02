
import { useCallback, useEffect, useState } from "react";
import "./App.css";

const cities = [
  { name: "Hà Nội", lat: 21.0285, lon: 105.8542 },
  { name: "Hải Phòng", lat: 20.8449, lon: 106.6881 },
  { name: "Huế", lat: 16.4637, lon: 107.5909 },
  { name: "Đà Nẵng", lat: 16.0544, lon: 108.2022 },
  { name: "Nha Trang", lat: 12.2388, lon: 109.1967 },
  { name: "Đà Lạt", lat: 11.9404, lon: 108.4583 },
  { name: "TP. Hồ Chí Minh", lat: 10.8231, lon: 106.6297 },
  { name: "Cần Thơ", lat: 10.0452, lon: 105.7469 },
];

function getWeather(code) {
  if (code === 0) return { icon: "☀️", text: "Trời quang" };
  if (code === 1) return { icon: "🌤️", text: "Ít mây" };
  if (code === 2) return { icon: "⛅", text: "Có mây" };
  if (code === 3) return { icon: "☁️", text: "Nhiều mây" };
  if (code <= 48) return { icon: "🌫️", text: "Sương mù" };
  if (code <= 57) return { icon: "🌦️", text: "Mưa phùn" };
  if (code <= 67) return { icon: "🌧️", text: "Có mưa" };
  if (code <= 77) return { icon: "❄️", text: "Tuyết" };
  if (code <= 82) return { icon: "🌦️", text: "Mưa rào" };
  if (code <= 86) return { icon: "🌨️", text: "Mưa tuyết" };
  if (code <= 99) return { icon: "⛈️", text: "Dông bão" };
  return { icon: "🌤️", text: "Không rõ" };
}

function formatDate(dateString) {
  return new Date(dateString + "T12:00:00").toLocaleDateString(
    "vi-VN",
    { day: "2-digit", month: "2-digit" }
  );
}

function getWeekday(dateString, index) {
  if (index === 0) return "Hôm nay";
  return new Date(dateString + "T12:00:00").toLocaleDateString(
    "vi-VN",
    { weekday: "short" }
  );
}

function convertTemp(value, unit) {
  return Math.round(unit === "F" ? (value * 9) / 5 + 32 : value);
}

export default function App() {
  const [city, setCity] = useState(cities[0]);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [unit, setUnit] = useState("C");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const loadWeather = useCallback(async () => {
    setLoading(true);
    setError("");
    setWeather(null);
    setForecast([]);

    try {
      const url =
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${city.lat}&longitude=${city.lon}` +
        "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
        "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
        "&timezone=Asia%2FHo_Chi_Minh&forecast_days=7";

      const response = await fetch(url);
      if (!response.ok) throw new Error("API_ERROR");

      const data = await response.json();

      if (!data.current || !data.daily) {
        throw new Error("EMPTY_DATA");
      }

      setWeather(data.current);

      const days = data.daily.time.map((date, index) => ({
        date,
        code: data.daily.weather_code[index],
        max: data.daily.temperature_2m_max[index],
        min: data.daily.temperature_2m_min[index],
      }));

      setForecast(days);
    } catch {
      setError("Không thể tải dữ liệu thời tiết. Vui lòng kiểm tra Internet và thử lại.");
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather, retryCount]);

  const condition = weather ? getWeather(weather.weather_code) : null;

  return (
    <main className="app">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Weather Day trang chủ">
          <span className="brand-icon">☁</span>
          <span>weather<span className="brand-light">day</span></span>
        </a>
        <span className="live-label">
          <span className="live-dot"></span>
          THỜI TIẾT TRỰC TUYẾN
        </span>
      </header>

      <section className="welcome">
        <p className="eyebrow">DỰ BÁO THỜI TIẾT VIỆT NAM</p>
        <h1>Hôm nay trời thế nào?</h1>
        <p className="welcome-text">
          Theo dõi thời tiết và lên kế hoạch cho ngày mới của bạn.
        </p>
      </section>

      <section className="city-section">
        <div className="section-heading">
          <h2>Khám phá thành phố</h2>
          <span>{cities.length} địa điểm</span>
        </div>

        <div className="city-list">
          {cities.map((item) => (
            <button
              key={item.name}
              className={`city-button ${city.name === item.name ? "active" : ""}`}
              onClick={() => setCity(item)}
              aria-pressed={city.name === item.name}
            >
              <span>{item.name}</span>
              {city.name === item.name && <span>✓</span>}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <section className="status-card" aria-live="polite">
          <div className="spinner"></div>
          <h2>Đang cập nhật thời tiết</h2>
          <p>Đang lấy dữ liệu cho {city.name}...</p>
        </section>
      ) : error ? (
        <section className="status-card error-card" aria-live="polite">
          <div className="status-icon">🌧️</div>
          <h2>Chưa thể tải dữ liệu</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={() => setRetryCount((n) => n + 1)}>
            ↻ Thử lại
          </button>
        </section>
      ) : !weather || forecast.length === 0 ? (
        <section className="status-card" aria-live="polite">
          <div className="status-icon">☁️</div>
          <h2>Chưa có dữ liệu</h2>
          <p>Hiện chưa có thông tin thời tiết để hiển thị.</p>
          <button className="retry-button" onClick={() => setRetryCount((n) => n + 1)}>
            Tải lại dữ liệu
          </button>
        </section>
      ) : (
        <>
          <section className="current-card">
            <div className="current-top">
              <div>
                <p className="card-kicker">THỜI TIẾT HIỆN TẠI</p>
                <h2>{city.name}</h2>
                <p className="current-date">
                  {new Date(weather.time).toLocaleString("vi-VN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: "Asia/Ho_Chi_Minh",
                  })}
                </p>
              </div>

              <div className="unit-toggle" aria-label="Chọn đơn vị nhiệt độ">
                <button
                  className={unit === "C" ? "chosen" : ""}
                  onClick={() => setUnit("C")}
                  aria-pressed={unit === "C"}
                >
                  °C
                </button>
                <button
                  className={unit === "F" ? "chosen" : ""}
                  onClick={() => setUnit("F")}
                  aria-pressed={unit === "F"}
                >
                  °F
                </button>
              </div>
            </div>

            <div className="main-weather">
              <div className="big-weather-icon" aria-hidden="true">
                {condition.icon}
              </div>
              <div className="temperature-block">
                <div className="big-temperature">
                  {convertTemp(weather.temperature_2m, unit)}
                  <span>°{unit}</span>
                </div>
                <p className="weather-description">{condition.text}</p>
                <p className="feels">
                  Cảm giác như {convertTemp(weather.apparent_temperature, unit)}°{unit}
                </p>
              </div>
            </div>

            <div className="weather-details">
              <div className="metric">
                <span className="metric-icon humidity-icon">💧</span>
                <div>
                  <p>Độ ẩm</p>
                  <strong>{weather.relative_humidity_2m}%</strong>
                </div>
              </div>
              <div className="metric">
                <span className="metric-icon wind-icon">💨</span>
                <div>
                  <p>Tốc độ gió</p>
                  <strong>{weather.wind_speed_10m} km/h</strong>
                </div>
              </div>
              <div className="metric">
                <span className="metric-icon temp-icon">🌡️</span>
                <div>
                  <p>Nhiệt độ</p>
                  <strong>{convertTemp(weather.temperature_2m, unit)}°{unit}</strong>
                </div>
              </div>
            </div>

            <p className="source-note">
              Dữ liệu trực tuyến từ Open-Meteo · Cập nhật theo giờ địa phương
            </p>
          </section>

          <section className="forecast-section">
            <div className="section-heading forecast-heading">
              <div>
                <p className="card-kicker">DỰ BÁO TƯƠNG LAI</p>
                <h2>7 ngày sắp tới</h2>
              </div>
              <span>7 ngày</span>
            </div>

            <div className="forecast-grid">
              {forecast.map((day, index) => {
                const dayWeather = getWeather(day.code);

                return (
                  <article className="forecast-day" key={day.date}>
                    <p className="forecast-weekday">
                      {getWeekday(day.date, index)}
                    </p>
                    <p className="forecast-date">{formatDate(day.date)}</p>
                    <div className="forecast-icon" aria-label={dayWeather.text}>
                      {dayWeather.icon}
                    </div>
                    <p className="forecast-description">{dayWeather.text}</p>
                    <div className="forecast-temperatures">
                      <strong>{convertTemp(day.max, unit)}°</strong>
                      <span>{convertTemp(day.min, unit)}°</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}

      <footer className="footer">
        <span className="footer-brand">☁ weatherday</span>
        <p>Ứng dụng thời tiết xây dựng bằng React</p>
        <p>Nguồn dữ liệu: Open-Meteo</p>
      </footer>
    </main>
  );
}

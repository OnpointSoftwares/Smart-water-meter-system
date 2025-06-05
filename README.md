# Smart Water Meter System

A comprehensive IoT-based water monitoring system that tracks water usage, detects leaks, and provides real-time analytics through a web interface.

## Features

- Real-time water usage monitoring
- Leak detection and alerts
- Historical usage data and analytics
- Multi-user support with role-based access
- Responsive web interface
- RESTful API for IoT device integration

## Technologies Used

- **Backend**: Django 4.2.7
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5, Chart.js
- **Database**: SQLite (development), PostgreSQL (production-ready)
- **IoT Communication**: Serial communication (pyserial)
- **Deployment**: Docker, Nginx, Gunicorn

## Prerequisites

- Python 3.8+
- pip (Python package manager)
- Virtual environment (recommended)
- Node.js and npm (for frontend assets)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-water-meter.git
   cd smart-water-meter
   ```

2. **Set up a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the project root:
   ```env
   DEBUG=True
   SECRET_KEY=your-secret-key-here
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Collect static files**
   ```bash
   python manage.py collectstatic --noinput
   ```

8. **Run the development server**
   ```bash
   python manage.py runserver
   ```

9. **Access the admin interface**
   Open your browser and go to `http://127.0.0.1:8000/admin/`

## Project Structure

```
smart-water-meter/
├── water_meter/               # Django project settings
├── meter/                      # Main app
│   ├── migrations/            # Database migrations
│   ├── static/                # Static files (CSS, JS, images)
│   ├── templates/             # HTML templates
│   ├── admin.py               # Admin configuration
│   ├── apps.py                # App config
│   ├── forms.py               # Form definitions
│   ├── models.py              # Database models
│   ├── urls.py                # URL routing
│   └── views.py               # View functions
├── .env                       # Environment variables
├── .gitignore                 # Git ignore file
├── manage.py                  # Django management script
├── README.md                  # This file
└── requirements.txt           # Python dependencies
```

## API Endpoints

- `GET /api/meters/` - List all water meters (authenticated)
- `POST /api/usage/` - Submit water usage data (for IoT devices)
- `GET /api/usage/<meter_id>/` - Get usage data for a specific meter

## IoT Integration

The system can receive data from Arduino-based water flow sensors. The Arduino code should send data in the following JSON format:

```json
{
    "meter_id": "METER001",
    "volume": 123.45,
    "flow_rate": 2.5,
    "temperature": 25.5,
    "api_key": "your-secure-api-key"
}
```

## Deployment

For production deployment, it's recommended to use:

1. **Web Server**: Nginx
2. **Application Server**: Gunicorn or uWSGI
3. **Database**: PostgreSQL
4. **Process Manager**: Systemd or Supervisor

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /static/ {
        alias /path/to/your/static/files/;
    }

    location /media/ {
        alias /path/to/your/media/files/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/path/to/your/app.sock;
    }
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For support, please open an issue in the GitHub repository.

## Acknowledgments

- [Django](https://www.djangoproject.com/)
- [Bootstrap](https://getbootstrap.com/)
- [Chart.js](https://www.chartjs.org/)
- [Font Awesome](https://fontawesome.com/)

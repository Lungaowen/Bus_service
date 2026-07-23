using CreditService.Data;
using CreditService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Database
var connectionString = builder.Configuration.GetConnectionString("Supabase");
builder.Services.AddDbContext<CreditDbContext>(options =>
{
    if (builder.Environment.IsDevelopment() && string.IsNullOrEmpty(connectionString))
        options.UseInMemoryDatabase("CreditDb");
    else
        options.UseNpgsql(connectionString ?? throw new InvalidOperationException("Supabase connection string is not configured"));
});

// JWT Validation (same issuer/secret as CardService so tokens are interchangeable)
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey is not configured");
var key = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// CardService HTTP client
var cardServiceBaseUrl = builder.Configuration["CardService:BaseUrl"] ?? "http://localhost:5233";
builder.Services.AddHttpClient<CardServiceClient>(client =>
{
    client.BaseAddress = new Uri(cardServiceBaseUrl);
    client.Timeout = TimeSpan.FromSeconds(10);
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Auto-create tables on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CreditDbContext>();
    context.Database.ExecuteSqlRaw(@"
        CREATE SCHEMA IF NOT EXISTS card_service;

        CREATE TABLE IF NOT EXISTS card_service.credit_advances (
            id SERIAL PRIMARY KEY,
            card_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            amount DECIMAL(18,2) NOT NULL,
            remaining_amount DECIMAL(18,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'ZAR',
            status VARCHAR(20) DEFAULT 'Outstanding',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            repaid_at TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS card_service.credit_limits (
            id SERIAL PRIMARY KEY,
            card_id INTEGER,
            user_id INTEGER NOT NULL,
            max_advance_amount DECIMAL(18,2) DEFAULT 500,
            currency VARCHAR(3) DEFAULT 'ZAR',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS ix_credit_advances_card_id ON card_service.credit_advances(card_id);
        CREATE INDEX IF NOT EXISTS ix_credit_advances_user_id ON card_service.credit_advances(user_id);
        CREATE INDEX IF NOT EXISTS ix_credit_advances_status ON card_service.credit_advances(status);
        CREATE INDEX IF NOT EXISTS ix_credit_limits_user_id ON card_service.credit_limits(user_id);
        CREATE INDEX IF NOT EXISTS ix_credit_limits_card_id ON card_service.credit_limits(card_id);
    ");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

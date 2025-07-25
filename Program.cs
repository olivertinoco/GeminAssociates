using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Diagnostics;
using Serilog;

DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

var archivoLog = builder.Configuration["AppSettings:ArchivoLog"] ?? "logs/log.txt";

// Configurar Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .WriteTo.Console(
        outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}"
    )
    .WriteTo.File(
        path: archivoLog,
        restrictedToMinimumLevel: Serilog.Events.LogEventLevel.Error,
        rollingInterval: RollingInterval.Day,
        outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}",
        retainedFileCountLimit: 7
    )
    .CreateLogger();


// Usar Serilog como logger
builder.Host.UseSerilog();


builder.Services.AddHttpClient();

// Add services to the container.
builder.Services.AddControllersWithViews();

// evita que los TempData no almacenen en cookies
builder.Services.AddSession();
builder.Services.AddSingleton<ITempDataProvider, SessionStateTempDataProvider>();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "text/html";

            var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
            if (exceptionHandlerPathFeature?.Error != null)
            {
                Log.Error(exceptionHandlerPathFeature.Error, "Unhandled exception occurred at {Path}", exceptionHandlerPathFeature.Path);
            }

            await context.Response.WriteAsync("<h1>Ocurrió un error en el servidor.</h1>");
        });
    });
    app.UseHsts();
}

app.UseHttpsRedirection();

//carga los archivos de Recurso eje. wwwroot/Images
app.UseStaticFiles();

app.UseRouting();

//para que el TempData no se guarde en cookies al asignarle cadena larga
app.UseSession();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}"
);


app.Run();

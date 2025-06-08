using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using General.Librerias.AccesoDatos;

namespace GeminAssociates.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly IConfiguration _configuration;

    public HomeController(ILogger<HomeController> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public IActionResult Index()
    {
        return View();
    }

    public IActionResult Datos()
    {
        ViewBag.Rpta = TempData["data"];
        ViewBag.Cred = TempData["xdg"];
        return View();
    }

    public string DataInicio()
    {
        try
        {
            String rpta = "";
            string tipoDoc = Request.Form["data1"].ToString();
            string nroDoc = Request.Form["data2"].ToString();
            string clave = Request.Form["data3"].ToString();
            string data = $"{tipoDoc}|{nroDoc}|{clave}";

            daSQL odaSQL = new daSQL(_configuration, "Cnx");
            rpta = odaSQL.ejecutarComando("dbo.usp_loginConvocatoria", "@data", data);
            TempData["data"] = rpta;
            TempData["xdg"] = $"{tipoDoc}|{nroDoc}";
            return "OK";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in DataInicio");
            return "ERROR";
        }
    }


    

}

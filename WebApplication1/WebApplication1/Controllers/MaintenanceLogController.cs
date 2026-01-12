    [HttpPost]
    [Authorize]
    public async Task<ActionResult<MaintenanceLog>> CreateLog(MaintenanceLog log)
    {
        log.Vehicle = null; 

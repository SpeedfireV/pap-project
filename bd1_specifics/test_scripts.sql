-- Klienci z ich fakturami
SELECT 
    c.clientid,
    c.name AS client_name,
    c.nip,
    i.invoiceid,
    i.invoicenumber,
    i.amount AS invoice_amount,
    i.paymentstatus,
    TO_CHAR(i.issuedate, 'YYYY-MM') AS invoice_month,
    COUNT(j.jobid) OVER (PARTITION BY c.clientid) AS total_jobs
FROM client c
FULL OUTER JOIN job j ON c.clientid = j.client_clientid
FULL OUTER JOIN invoice i ON j.jobid = i.job_jobid
WHERE i.issuedate >= ADD_MONTHS(SYSDATE, -12)
   OR i.issuedate IS NULL
ORDER BY c.clientid NULLS LAST, i.issuedate DESC;


-- Działające pojazdy które nie miały serwisu w bierzącym roku
SELECT 
    v.vehicleid,
    v.licenseplate,
    v.type,
    v.state,
    v.capacity,
    (SELECT MAX(servicedate) 
     FROM maintencelog ml2 
     WHERE ml2.vehicle_vehicleid = v.vehicleid) AS last_service_date
FROM vehicle v
WHERE v.state = 'OPERATIONAL'
  AND NOT EXISTS (
    SELECT 1 
    FROM maintencelog ml 
    WHERE ml.vehicle_vehicleid = v.vehicleid
      AND EXTRACT(YEAR FROM ml.servicedate) = EXTRACT(YEAR FROM SYSDATE)
  )
ORDER BY last_service_date NULLS FIRST;



-- Test funkcji calculate_job_profit dla różnych zleceń
SELECT 
    j.jobid,
    c.name AS client_name,
    j.startdate,
    j.status,
    i.amount AS invoice_amount,
    calculate_job_profit(j.jobid) AS calculated_profit,
    CASE 
        WHEN calculate_job_profit(j.jobid) > 0 THEN 'PROFIT'
        WHEN calculate_job_profit(j.jobid) < 0 THEN 'LOSS'
        ELSE 'BREAK_EVEN'
    END AS profit_status
FROM job j
INNER JOIN client c ON j.client_clientid = c.clientid
INNER JOIN invoice i ON j.jobid = i.job_jobid
WHERE j.startdate >= ADD_MONTHS(SYSDATE, -3)
ORDER BY calculated_profit DESC
FETCH FIRST 10 ROWS ONLY;


-- Test funkcji count_active_transports
SELECT 
    d.driverid,
    d.name || ' ' || d.surname AS driver_name,
    d.status,
    count_active_transports(d.driverid) AS current_active_transports,
    COUNT(t.transportid) AS total_historical_transports
FROM driver d
LEFT JOIN transport t ON d.driverid = t.driver_driverid
GROUP BY d.driverid, d.name, d.surname, d.status
HAVING count_active_transports(d.driverid) > 0
ORDER BY current_active_transports DESC, total_historical_transports DESC;


-- Test procedury generate_client_report dla kilku klientów
BEGIN
    FOR i IN 1..3 LOOP
        DBMS_OUTPUT.PUT_LINE(CHR(10) || '=== TEST PROCEDURY DLA KLIENTA ID: ' || i * 100 || ' ===');
        generate_client_report(i * 100);
    END LOOP;
END;
/


-- Test procedury update_vehicles_status
-- Przed uruchomieniem procedury
SELECT 
    v.vehicleid,
    v.licenseplate,
    v.state AS current_state,
    ml.servicetype,
    ml.servicedate AS last_service,
    ml.nextservicedue
FROM vehicle v
LEFT JOIN maintencelog ml ON v.vehicleid = ml.vehicle_vehicleid
WHERE ml.nextservicedue < SYSDATE
   AND v.state != 'SERWIS'
ORDER BY ml.nextservicedue;

-- Uruchomienie procedury
BEGIN
    update_vehicles_status;
END;
/

-- Po uruchomieniu procedury
SELECT 
    v.vehicleid,
    v.licenseplate,
    v.state AS updated_state
FROM vehicle v
WHERE v.state = 'SERWIS'
ORDER BY v.vehicleid;


-- Test triggera tg_log_status_history
SELECT jobid, status FROM job WHERE jobid = 1;

-- Aktualizacja statusu
UPDATE job 
SET status = 'IN_PROGRESS' 
WHERE jobid = 1;

-- Sprawdzenie historii
SELECT 
    sh.job_jobid,
    sh.oldstatus,
    sh.newstatus,
    sh.changedate
FROM statushistory sh
WHERE sh.job_jobid = 1
ORDER BY sh.changedate DESC;

-- Kolejna zmiana
UPDATE job 
SET status = 'COMPLETED' 
WHERE jobid = 1;

-- Sprawdzenie pełnej historii
SELECT * FROM statushistory 
WHERE job_jobid = 1 
ORDER BY changedate DESC;

ROLLBACK;


-- Test triggera tg_check_capacity
DECLARE
    v_vehicle_capacity INTEGER;
    v_test_cargomass INTEGER;
BEGIN
    -- Znajdź przykładowy pojazd i jego pojemność
    SELECT capacity INTO v_vehicle_capacity 
    FROM vehicle 
    WHERE vehicleid = 1;
    
    DBMS_OUTPUT.PUT_LINE('Pojemność pojazdu ID 1: ' || v_vehicle_capacity);
    
    -- Próba wstawienia z ładunkiem większym niż pojemność
    v_test_cargomass := v_vehicle_capacity + 1000;
    
    DBMS_OUTPUT.PUT_LINE('Próba dodania transportu z ładunkiem: ' || v_test_cargomass);
    
    INSERT INTO transport (
        transportid,
        job_jobid,
        vehicle_vehicleid,
        driver_driverid,
        startdate,
        enddate,
        cargomass,
        status
    ) VALUES (
        (SELECT MAX(transportid) + 1 FROM transport),
        1,
        1,
        1,
        SYSDATE,
        SYSDATE + 2,
        v_test_cargomass,
        'PLANNED'
    );
    
    DBMS_OUTPUT.PUT_LINE('SUKCES: Transport dodany');
    ROLLBACK;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('BŁĄD: ' || SQLERRM);
        ROLLBACK;
END;
/
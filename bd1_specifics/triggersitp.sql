--------------------------------------------------------------------------------
-- 1. FUNKCJA: Obliczanie zysku z danego zlecenia
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_job_profit(p_job_id INTEGER)
RETURN NUMBER IS
    v_invoice_amount NUMBER := 0;
    v_total_costs    NUMBER := 0;
    v_profit         NUMBER;
BEGIN
    BEGIN
        SELECT amount INTO v_invoice_amount
        FROM invoice
        WHERE job_jobid = p_job_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            v_invoice_amount := 0;
    END;

    SELECT NVL(SUM(tc.amount), 0)
    INTO v_total_costs
    FROM transport t
    JOIN transportcost tc ON t.transportid = tc.transport_transportid
    WHERE t.job_jobid = p_job_id;

    v_profit := v_invoice_amount - v_total_costs;

    RETURN v_profit;
END;
/

--------------------------------------------------------------------------------
-- 2. FUNKCJA: Sprawdzanie obciążenia kierowcy
-- Zwraca liczbę aktywnych transportów (niezakończonych) dla danego kierowcy.
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION count_active_transports(p_driver_id INTEGER)
RETURN INTEGER IS
    v_count INTEGER := 0;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM transport
    WHERE driver_driverid = p_driver_id
      AND status NOT IN ('COMPLETED', 'CANCELLED');

    RETURN v_count;
END;
/

--------------------------------------------------------------------------------
-- 3. PROCEDURA: Generowanie raportu finansowego dla klienta
--------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE generate_client_report(p_client_id INTEGER) IS
    v_client_name client.name%TYPE;
    v_job_id      job.jobid%TYPE;
    v_job_date    job.startdate%TYPE;
    v_job_profit  NUMBER;
    v_total_profit NUMBER := 0;

    CURSOR c_jobs IS
        SELECT jobid, startdate
        FROM job
        WHERE client_clientid = p_client_id
        ORDER BY startdate DESC
        FETCH FIRST 20 ROWS ONLY;

BEGIN
    SELECT name INTO v_client_name FROM client WHERE clientid = p_client_id;

    DBMS_OUTPUT.PUT_LINE('RAPORT ZYSKÓW DLA KLIENTA: ' || v_client_name);
    DBMS_OUTPUT.PUT_LINE('--------------------------------------------------');

    OPEN c_jobs;
    LOOP
        FETCH c_jobs INTO v_job_id, v_job_date;
        EXIT WHEN c_jobs%NOTFOUND;

        v_job_profit := calculate_job_profit(v_job_id);

        DBMS_OUTPUT.PUT_LINE('Zlecenie ID: ' || v_job_id ||
                             ' | Data: ' || TO_CHAR(v_job_date, 'YYYY-MM-DD') ||
                             ' | Zysk: ' || v_job_profit || ' PLN');

        v_total_profit := v_total_profit + v_job_profit;
    END LOOP;

    CLOSE c_jobs;

    DBMS_OUTPUT.PUT_LINE('--------------------------------------------------');
    DBMS_OUTPUT.PUT_LINE('SUMA ZYSKU (z ostatnich max 20 zleceń): ' || v_total_profit || ' PLN');
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Nie znaleziono klienta o podanym ID.');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Wystąpił błąd: ' || SQLERRM);
        IF c_jobs%ISOPEN THEN CLOSE c_jobs; END IF;
END;
/

--------------------------------------------------------------------------------
-- 4. PROCEDURA: Aktualizacja statusu pojazdów na podstawie serwisu
-- Sprawdza, czy 'nextservicedue' minęło i zmienia stan pojazdu.
--------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE update_vehicles_status IS
    v_updated_count INTEGER := 0;
BEGIN
    FOR r_vehicle IN (
        SELECT v.vehicleid, v.licenseplate, m.nextservicedue
        FROM vehicle v
        JOIN maintencelog m ON v.vehicleid = m.vehicle_vehicleid
        WHERE m.nextservicedue < SYSDATE
          AND v.state != 'SERWIS'
    ) LOOP
        UPDATE vehicle
        SET state = 'SERWIS'
        WHERE vehicleid = r_vehicle.vehicleid;

        DBMS_OUTPUT.PUT_LINE('Pojazd ' || r_vehicle.licenseplate ||
                             ' (ID: ' || r_vehicle.vehicleid ||
                             ') wymaga serwisu! Termin minął: ' || r_vehicle.nextservicedue);

        v_updated_count := v_updated_count + 1;
    END LOOP;

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Zaktualizowano status dla ' || v_updated_count || ' pojazdów.');
END;
/

--------------------------------------------------------------------------------
-- 5. WYZWALACZ (TRIGGER): Logowanie zmian statusu zlecenia
-- Odpowiada na zmiany w tabeli JOB i zapisuje historię w STATUSHISTORY.
--------------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER tg_log_status_history
AFTER UPDATE OF status ON job
FOR EACH ROW
BEGIN
    IF :OLD.status != :NEW.status THEN
        INSERT INTO statushistory (
            statushistoryid,
            job_jobid,
            userid,
            oldstatus,
            newstatus,
            changedate
        )
        VALUES (
            (SELECT NVL(MAX(statushistoryid), 0) + 1 FROM statushistory),
            :NEW.jobid,
            NULL,
            :OLD.status,
            :NEW.status,
            CURRENT_TIMESTAMP
        );
    END IF;
END;
/

--------------------------------------------------------------------------------
-- 6. WYZWALACZ (TRIGGER): Weryfikacja ładowności pojazdu
-- Przed dodaniem transportu sprawdza, czy masa ładunku nie przekracza pojemności auta.
--------------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER tg_check_capacity
BEFORE INSERT OR UPDATE ON transport
FOR EACH ROW
DECLARE
    v_vehicle_capacity INTEGER;
BEGIN
    SELECT capacity INTO v_vehicle_capacity
    FROM vehicle
    WHERE vehicleid = :NEW.vehicle_vehicleid;

    IF :NEW.cargomass > v_vehicle_capacity THEN
        RAISE_APPLICATION_ERROR(-20001,
            'Błąd: Masa ładunku (' || :NEW.cargomass ||
            ') przekracza ładowność pojazdu (' || v_vehicle_capacity || ').');
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20002, 'Błąd: Nie znaleziono pojazdu o podanym ID.');
END;
/


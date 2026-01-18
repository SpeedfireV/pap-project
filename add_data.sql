SET SERVEROUTPUT ON;

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE invoice MODIFY invoicenumber VARCHAR2(50)';
    EXECUTE IMMEDIATE 'DROP INDEX MAINTENCELOG__IDX';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

DECLARE
    v_job_count       CONSTANT NUMBER := 5000;
    v_transport_count CONSTANT NUMBER := 6000; 
    v_vehicle_count   CONSTANT NUMBER := 200;
    v_client_count    CONSTANT NUMBER := 500;
BEGIN
    DBMS_OUTPUT.PUT_LINE('1. Czyszczenie danych...');
    DELETE FROM maintencelog;
    DELETE FROM transportcost;
    DELETE FROM cargo;
    DELETE FROM route;
    DELETE FROM statushistory;
    DELETE FROM invoice;
    DELETE FROM transport;
    DELETE FROM job;
    DELETE FROM vehicle;
    DELETE FROM driver;
    DELETE FROM client;
    DELETE FROM error;

    DBMS_OUTPUT.PUT_LINE('2. Słowniki (Klienci, Kierowcy, Pojazdy)...');

    FOR i IN 1..v_client_count LOOP
        INSERT INTO client (clientid, name, nip, address, phone)
        VALUES (i, 'Firma ' || i, 1000000000 + i, 'Adres ' || i, 500000000 + i);
    END LOOP;

    FOR i IN 1..400 LOOP
        INSERT INTO driver (driverid, name, surname, licensenumber, phone, status)
        VALUES (i, 'Jan' || i, 'Kowalski' || i, 1000 + i, 600000000 + i, 'AVAILABLE');
    END LOOP;

    FOR i IN 1..v_vehicle_count LOOP
        INSERT INTO vehicle (vehicleid, licenseplate, type, capacity, state)
        VALUES (i, 'WA' || (10000 + i), 'Truck', 24000, 'OPERATIONAL');
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('3. Zlecenia i Faktury...');
    FOR i IN 1..v_job_count LOOP
        INSERT INTO job (jobid, client_clientid, startdate, status, remarks)
        VALUES (i, TRUNC(DBMS_RANDOM.VALUE(1, v_client_count + 1)), SYSDATE - 10, 'NEW', 'Brak uwag');
        
        BEGIN
            INSERT INTO invoice (invoiceid, job_jobid, invoicenumber, amount, issuedate, paymentdate, paymentstatus)
            VALUES (i, i, i, DBMS_RANDOM.VALUE(1000, 5000), SYSDATE, SYSDATE + 14, 'UNPAID');
        EXCEPTION WHEN OTHERS THEN
            INSERT INTO invoice (invoiceid, job_jobid, invoicenumber, amount, issuedate, paymentdate, paymentstatus)
            VALUES (i, i, i, 0, SYSDATE, SYSDATE + 14, 'ERROR');
        END;
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('4. Transporty i Trasy...');
    FOR i IN 1..v_transport_count LOOP
        INSERT INTO transport (transportid, job_jobid, vehicle_vehicleid, driver_driverid, startdate, enddate, cargomass, status)
        VALUES (i, TRUNC(DBMS_RANDOM.VALUE(1, v_job_count + 1)), 
                TRUNC(DBMS_RANDOM.VALUE(1, v_vehicle_count + 1)),
                TRUNC(DBMS_RANDOM.VALUE(1, 401)),
                SYSDATE, SYSDATE + 2, 15000, 'IN_TRANSIT');

        INSERT INTO route (routeid, transport_transportid, startpoint, endpoint, distance, estimatedtime)
        VALUES (i, i, 'Start ' || i, 'Cel ' || i, 450, SYSDATE + 1);
        
        INSERT INTO cargo (cargoid, transport_transportid, name, description, amount)
        VALUES (i, i, 'Towar ' || i, 'Opis ładunku', 10);
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('5. Koszty i Serwis...');
    FOR i IN 1..10000 LOOP
        INSERT INTO transportcost (transportcostid, transport_transportid, description, amount, currency, dateincurred, category)
        VALUES (i, TRUNC(DBMS_RANDOM.VALUE(1, v_transport_count + 1)), 'Paliwo', 500.50, 'PLN', CURRENT_TIMESTAMP, 'FUEL');
    END LOOP;

    FOR i IN 1..2000 LOOP
        INSERT INTO maintencelog (maintenanceid, vehicle_vehicleid, servicetype, odometerreading, description, cost, servicedate, nextservicedue)
        VALUES (i, TRUNC(DBMS_RANDOM.VALUE(1, v_vehicle_count + 1)), 'Olej', 120000, 'Wymiana okresowa', 600, SYSDATE-5, SYSDATE+180);
    END LOOP;

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('--- SUKCES: Baza została wypełniona ---');
END;
/
alter table public.barbershops
  add column if not exists legal_name text,
  add column if not exists cnpj text,
  add column if not exists zip_code text,
  add column if not exists address_number text,
  add column if not exists address_complement text,
  add column if not exists neighborhood text;

drop policy if exists "owners admins update barbershop" on public.barbershops;
create policy "owners admins update barbershop" on public.barbershops
  for update to authenticated
  using (private.has_barbershop_role(id, array['owner','admin']::public.user_role[]))
  with check (private.has_barbershop_role(id, array['owner','admin']::public.user_role[]));

drop policy if exists "members manage operational tables" on public.barbers;
create policy "members read barbers" on public.barbers
  for select to authenticated
  using (barbershop_id in (select private.current_barbershop_ids()));
create policy "owners admins manage barbers" on public.barbers
  for all to authenticated
  using (private.has_barbershop_role(barbershop_id, array['owner','admin']::public.user_role[]))
  with check (private.has_barbershop_role(barbershop_id, array['owner','admin']::public.user_role[]));
create policy "barbers update own profile" on public.barbers
  for update to authenticated
  using (user_id = auth.uid() and barbershop_id in (select private.current_barbershop_ids()))
  with check (user_id = auth.uid() and barbershop_id in (select private.current_barbershop_ids()));

drop policy if exists "members manage services" on public.services;
create policy "members read services" on public.services
  for select to authenticated
  using (barbershop_id in (select private.current_barbershop_ids()));
create policy "owners admins manage services" on public.services
  for all to authenticated
  using (private.has_barbershop_role(barbershop_id, array['owner','admin']::public.user_role[]))
  with check (private.has_barbershop_role(barbershop_id, array['owner','admin']::public.user_role[]));

drop policy if exists "members manage appointments" on public.appointments;
create policy "members read appointments" on public.appointments
  for select to authenticated
  using (barbershop_id in (select private.current_barbershop_ids()));
create policy "owners admins reception manage appointments" on public.appointments
  for all to authenticated
  using (private.has_barbershop_role(barbershop_id, array['owner','admin','receptionist']::public.user_role[]))
  with check (private.has_barbershop_role(barbershop_id, array['owner','admin','receptionist']::public.user_role[]));
create policy "barbers manage own appointments except delete" on public.appointments
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.barbers b
      where b.id = appointments.barber_id
        and b.user_id = auth.uid()
        and b.barbershop_id = appointments.barbershop_id
    )
  );
create policy "barbers update own appointments" on public.appointments
  for update to authenticated
  using (
    exists (
      select 1
      from public.barbers b
      where b.id = appointments.barber_id
        and b.user_id = auth.uid()
        and b.barbershop_id = appointments.barbershop_id
    )
  )
  with check (
    exists (
      select 1
      from public.barbers b
      where b.id = appointments.barber_id
        and b.user_id = auth.uid()
        and b.barbershop_id = appointments.barbershop_id
    )
  );

drop policy if exists "financial owner admin receptionist commands" on public.commands;
create policy "owners admins manage commands" on public.commands
  for all to authenticated
  using (private.has_barbershop_role(barbershop_id, array['owner','admin']::public.user_role[]))
  with check (private.has_barbershop_role(barbershop_id, array['owner','admin']::public.user_role[]));
create policy "reception write commands except delete" on public.commands
  for insert to authenticated
  with check (private.has_barbershop_role(barbershop_id, array['owner','admin','receptionist']::public.user_role[]));
create policy "reception read commands" on public.commands
  for select to authenticated
  using (private.has_barbershop_role(barbershop_id, array['receptionist']::public.user_role[]));
create policy "reception update commands" on public.commands
  for update to authenticated
  using (private.has_barbershop_role(barbershop_id, array['receptionist']::public.user_role[]))
  with check (private.has_barbershop_role(barbershop_id, array['receptionist']::public.user_role[]));
create policy "barbers read own commands" on public.commands
  for select to authenticated
  using (
    exists (
      select 1
      from public.barbers b
      where b.id = commands.barber_id
        and b.user_id = auth.uid()
        and b.barbershop_id = commands.barbershop_id
    )
  );
create policy "barbers insert own commands" on public.commands
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.barbers b
      where b.id = commands.barber_id
        and b.user_id = auth.uid()
        and b.barbershop_id = commands.barbershop_id
    )
  );
create policy "barbers update own open commands" on public.commands
  for update to authenticated
  using (
    status <> 'paga'
    and exists (
      select 1
      from public.barbers b
      where b.id = commands.barber_id
        and b.user_id = auth.uid()
        and b.barbershop_id = commands.barbershop_id
    )
  )
  with check (
    exists (
      select 1
      from public.barbers b
      where b.id = commands.barber_id
        and b.user_id = auth.uid()
        and b.barbershop_id = commands.barbershop_id
    )
  );

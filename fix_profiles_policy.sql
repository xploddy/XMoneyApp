-- Correção da política de UPDATE do profiles para evitar recursão infinita
-- Execute este script no Supabase SQL Editor

-- Remover a política antiga
DROP POLICY IF EXISTS "Usuários podem atualizar o próprio perfil" ON profiles;

-- Criar a política corrigida
CREATE POLICY "Usuários podem atualizar o próprio perfil" 
ON profiles 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

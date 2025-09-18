import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;

    if (!value) {
      return { required: 'Campo Cel/Mobile é obrigatório!' };
    }

    // Remove todos os caracteres não numéricos
    const formattedValue = value.replace(/\D/g, '');

    // Verifica se o formato do número é válido
    const validFormat = /^\d{11}$/.test(formattedValue);

    if (!validFormat) {
      return { invalidPhone: { message: 'Formato de celular inválido. Use (xx) xxxxx-xxxx.' } };
    }

    // Aplica a máscara ao valor formatado
    const maskedValue = `(${formattedValue.slice(0, 2)}) ${formattedValue.slice(2, 7)}-${formattedValue.slice(7, 11)}`;

    // Verifica se o valor já está no formato desejado antes de definir
    if (control.value !== maskedValue) {
      control.setValue(maskedValue, { emitEvent: false });
    }

    // Limpa os erros personalizados para garantir que a mensagem de erro seja exibida corretamente
    control.setErrors(null);

    return null;
  };
}

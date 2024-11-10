Date.prototype.formatted = function () {
  return Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(this)
}

export {}
